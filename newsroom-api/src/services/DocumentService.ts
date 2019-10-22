import { drive_v3, google } from "googleapis";
import { Guid } from "guid-typescript";
import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { GoogleOAuth2ServerCredentialsProvider } from "../configs/GoogleOAuth2ServerCredentialsProvider";
import { NRDocument, NRStage, NRSTPermission, NRUser } from "../entity";
import { Access } from "../entity/DBConstants";
import { PermissionService } from "./PermissionService";
import { RoleService } from "./RoleService";

@Service()
export class DocumentService {
    @InjectRepository(NRDocument)
    private dcRep: Repository<NRDocument>;

    @Inject()
    private permServ: PermissionService;

    @Inject()
    private roleService: RoleService;

    private readonly serverCredentialProvider: GoogleOAuth2ServerCredentialsProvider;

    private readonly drive: drive_v3.Drive;

    constructor(serverCredentialProvider: GoogleOAuth2ServerCredentialsProvider) {
        this.serverCredentialProvider = serverCredentialProvider;

        this.drive = google.drive({
            auth: this.serverCredentialProvider.getOAuth2Client(),
            version: "v3",
        });
    }

    public async getDocument(did: number): Promise<NRDocument> {
        try {
            return await this.dcRep.findOneOrFail(did);
        } catch (err) {
            console.error("Error getting document:", err);

            const errStr = `Document with ID ${did} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async appendPermToDC(dc: NRDocument, st: NRStage, usr: NRUser) {
        dc.permission = await this.permServ.getDCPermForUser(dc, st, usr);
    }

    public async appendPermsToDCS(dcs: NRDocument[], usr: NRUser) {
        for (const dc of dcs) {
            const dcwst = await this.dcRep.findOne(dc.id, {relations: ["stage"]});
            await this.appendPermToDC(dc, dcwst.stage, usr);
        }
    }

    /**
     * Creates a new Google Doc and syncs current stage permissions with the doc.
     * @param user The user who is creating the doc.
     * @param doc The document model that is being created. Stage should already be set properly.
     */
    public async createGoogleDocument(user: NRUser, doc: NRDocument) {
        if (process.env.DO_GOOGLE === "N") {
            doc.googleDocId = Guid.create().toString();
            return; 
        }

        const docs = google.docs({
            auth: this.serverCredentialProvider.getOAuth2Client(),
            version: "v1",
        });

        const result = await docs.documents.create({
            requestBody: {
                title: doc.name,
            },
        });

        doc.googleDocId = result.data.documentId;

        await this.syncGooglePermissionsForDocument(doc);
    }

    public async updateGoogleDocumentTitle(user: NRUser, doc: NRDocument) {
        if (process.env.DO_GOOGLE === "N") {
            return;
        }

        await this.drive.files.update({
            fileId: doc.googleDocId,
            requestBody: {
                name: doc.name,
            },
        });
    }

    public async deleteGoogleDocument(user: NRUser, id: string) {
        if (process.env.DO_GOOGLE === "N") {
            return;
        }

        await this.drive.files.delete({
            fileId: id,
        });
    }

    public async syncGooglePermissionsForDocument(document: NRDocument) {
        if (process.env.DO_GOOGLE === "N") {
            return;
        }

        console.log("Syncing permissions for document: " + document.name);

        const usersWithAccess = await this.getAllUsersWithAccessToDocument(document);

        console.log(usersWithAccess);

        await this.syncGooglePermissionsForUsers(document, usersWithAccess);
    }

    public async syncGooglePermissionsForStage(stagePermission: NRSTPermission) {
        if (process.env.DO_GOOGLE === "N") {
            return;
        }

        console.log("Syncing permissions for all documents in stage: " + stagePermission.stage.name);

        const documents = await this.dcRep.find({
            relations: ["stage"],
            where: {stage: stagePermission.stage},
        });

        const usersWithAccess = await this.getAllUsersWithAccessForStage(stagePermission);

        await documents.forEach(async (document) => {
            await this.syncGooglePermissionsForUsers(document, usersWithAccess);
        });
    }

    public async appendAssigneeToDC(dc: NRDocument) {
        const ass = await this.dcRep.findOne(dc.id, {relations: ["assignee"]});
        dc.assignee = ass.assignee;
    }

    public async appendAssigneeToDCS(dcs: NRDocument[]) {
        for (const dc of dcs) {
            await this.appendAssigneeToDC(dc);
        }
    }

    private async syncGooglePermissionsForUsers(document: NRDocument, usersWithAccess: UserWithAccess[]) {
        const permissionsResponse = await this.drive.permissions.list({
            fields: "permissions/id,permissions/role,permissions/emailAddress",
            fileId: document.googleDocId,
        });

        if (permissionsResponse.status !== 200) {
            throw new Error("Error getting Google Doc permissions: " + permissionsResponse.data);
        }

        const permissions = permissionsResponse.data.permissions.filter((permission) => permission.role !== Role.OWNER);

        this.updateOrDeleteExistingPermission(document, permissions, usersWithAccess);

        this.createMissingPermissions(document, permissions, usersWithAccess);
    }

    private async updateOrDeleteExistingPermission(document: NRDocument,
                                                   permissions: drive_v3.Schema$Permission[],
                                                   usersWithAccess: UserWithAccess[]) {
        const emailToUserMap = new Map(usersWithAccess.map((user) => [user.email, user]));

        return await permissions
            .map(async (permission) => {
                const user = emailToUserMap.get(permission.emailAddress);

                if (!user) {
                    // User not in desired user list, delete permission
                    return await this.deletePermission(document, permission.id);
                }

                if (user.access === Access.READ && permission.role === Role.READ ||
                    user.access === Access.WRITE && permission.role === Role.WRITE) {
                    // User is authorized correctly no changes needed
                    return;
                }

                return await this.updatePermission(document, permission.id, user.access);
            });
    }

    private async createMissingPermissions(document: NRDocument,
                                           permissions: drive_v3.Schema$Permission[],
                                           usersWithAccess: UserWithAccess[]) {
        const permissionEmails = new Set(permissions.map((permission) => permission.emailAddress));

        return usersWithAccess
            .filter((user) => !permissionEmails.has(user.email))
            .map((user) => {
                return {
                    emailAddress: user.email,
                    role: Role.fromAccess(user.access),
                    type: "user",
                };
            })
            .map(async (permission) => {
                try {
                    return await this.drive.permissions.create({
                        fileId: document.googleDocId,
                        requestBody: permission,
                        sendNotificationEmail: false,
                    });
                } catch (err) {
                    console.log("Error creating Google Doc permissions:", err.message);
                }
            });
    }

    private async deletePermission(document: NRDocument,
                                   permissionId: string) {
        return await this.drive.permissions.delete({
            fileId: document.googleDocId,
            permissionId,
        });
    }

    private async updatePermission(document: NRDocument,
                                   permissionId: string,
                                   access: Access) {
        return await this.drive.permissions.update({
            fileId: document.googleDocId,
            permissionId,
            requestBody: {
                role: Role.fromAccess(access),
            },
        });
    }

    private async getAllUsersWithAccessToDocument(document: NRDocument) {
        const allPermissions = await this.permServ.getAllStagePermissionsForStage(document.stage);

        const listsOfUsers = await Promise.all(allPermissions.map(async (stagePermission) => {
            const users = await this.roleService.getUsersInRole(stagePermission.role.id);

            return users.map((user) => {
                const userWithAccess = user as UserWithAccess;
                userWithAccess.access = stagePermission.access;

                return userWithAccess;
            });

        }));

        const allUsers = ([] as UserWithAccess[])
            .concat(...listsOfUsers)
            .concat(await this.getAllAdmins());

        return this.filterDuplicateUsers(allUsers);
    }

    private async getAllUsersWithAccessForStage(stagePermission: NRSTPermission) {
        const allUsers = (await this.roleService
            .getUsersInRole(stagePermission.role.id))
            .map((user) => {
                const userWithAccess = user as UserWithAccess;
                userWithAccess.access = stagePermission.access;

                return userWithAccess;
            })
            .concat(await this.getAllAdmins());

        return this.filterDuplicateUsers(allUsers);
    }

    private async getAllAdmins() {
        const admins = await this.permServ.getAllAdmins();

        const adminsWithAccess = admins.map((user) => {
            const userWithAccess = user as UserWithAccess;
            userWithAccess.access = Access.WRITE;
            return userWithAccess;
        });

        return adminsWithAccess;
    }

    private filterDuplicateUsers(users: UserWithAccess[]) {
        const emailToUserMap = new Map<string, UserWithAccess>();

        users.forEach((userWithAccess) => {
            const storedUser = emailToUserMap.get(userWithAccess.email);

            if (!storedUser || storedUser.access < userWithAccess.access) {
                emailToUserMap.set(userWithAccess.email, userWithAccess);
            }
        });

        return users;
    }
}

interface UserWithAccess extends NRUser {
    access: Access;
}

enum Role {
    READ = "reader",
    WRITE = "writer",
    OWNER = "owner",
}

// tslint:disable-next-line:no-namespace
namespace Role {
    // Extend enum namespace with function
    export function fromAccess(access: Access) {
        return access === Access.WRITE ? Role.WRITE : Role.READ;
    }
}
