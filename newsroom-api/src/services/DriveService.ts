import { drive_v3, google } from "googleapis";
import { Guid } from "guid-typescript";
import { Inject, Service } from "typedi";
import { GoogleOAuth2ServerCredentialsProvider } from "../configs/GoogleOAuth2ServerCredentialsProvider";
import { NRDocument, NRStage, NRSTPermission, NRUser } from "../entity";
import { Access } from "../entity/DBConstants";
import { PermissionService } from "./PermissionService";
import { RoleService } from "./RoleService";

@Service()
export class DriveService {
    @Inject()
    private roleService: RoleService;

    @Inject()
    private permServ: PermissionService;

    private readonly serverCredentialProvider: GoogleOAuth2ServerCredentialsProvider;

    private drive: drive_v3.Drive;

    constructor(serverCredentialProvider: GoogleOAuth2ServerCredentialsProvider) {
        this.serverCredentialProvider = serverCredentialProvider;

        this.serverCredentialProvider.getOAuth2Client().getClient().then((client) => {
            this.drive = google.drive({
                auth: client,
                version: "v3",
            });
        });
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

        const result = await this.drive.files.create({
            requestBody: {
                mimeType: "application/vnd.google-apps.document",
                name: doc.name,
                parents: [doc.stage.googleDriveFolderId],
            },
        });

        doc.googleDocId = result.data.id;
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

    public async createStageDriveFolder(stage: NRStage) {
        if (process.env.DO_GOOGLE === "N") {
            stage.googleDriveFolderId = Guid.create().toString();
            return;
        }

        console.log("Creating stage Drive folder: " + stage.name);

        const result = await this.drive.files.create({
            requestBody: {
                mimeType: "application/vnd.google-apps.folder",
                name: this.getStageFolderName(stage),
            },
        });

        stage.googleDriveFolderId = result.data.id;

        const adminsWithAccess = (await this.getAllAdmins()).map((user) => {
            const userWithAccess = user as UserWithAccess;
            user.access = Access.WRITE;
            return userWithAccess;
        });

        this.syncGooglePermissionsForUsers(stage, adminsWithAccess);
    }

    public async updateStageDriveFolderName(stage: NRStage) {
        if (process.env.DO_GOOGLE === "N") {
            stage.googleDriveFolderId = Guid.create().toString();
            return;
        }

        console.log("Updating stage Drive folder name: " + stage.name);

        await this.drive.files.update({
            fileId: stage.googleDriveFolderId,
            requestBody: {
                name: this.getStageFolderName(stage),
            },
        });
    }

    public async syncGooglePermissionsForStage(stagePermission: NRSTPermission) {
        if (process.env.DO_GOOGLE === "N") {
            return;
        }

        console.log("Syncing permissions for stage Drive folder: " + stagePermission.stage.name);

        const usersWithAccess = await this.getAllUsersWithAccessForStage(stagePermission);

        await this.syncGooglePermissionsForUsers(stagePermission.stage, usersWithAccess);
    }

    public async syncGoogleDocStageFolder(document: NRDocument, oldStage: NRStage) {
        if (process.env.DO_GOOGLE === "N") {
            return;
        }

        console.log("Moving Google Doc from old stage folder to new stage folder");

        try {
            await this.drive.files.update({
                addParents: document.stage.googleDriveFolderId,
                fileId: document.googleDocId,
                removeParents: oldStage.googleDriveFolderId,
            });
        } catch (err) {
            console.log("Error moving document to new stage folder", err);
        }
    }

    private async syncGooglePermissionsForUsers(stage: NRStage, usersWithAccess: UserWithAccess[]) {
        const permissionsResponse = await this.drive.permissions.list({
            fields: "permissions/id,permissions/role,permissions/emailAddress",
            fileId: stage.googleDriveFolderId,
        });

        if (permissionsResponse.status !== 200) {
            throw new Error("Error getting Google Drive folder permissions: " + permissionsResponse.data);
        }

        const permissions = permissionsResponse.data.permissions.filter((permission) => permission.role !== Role.OWNER);

        this.updateOrDeleteExistingPermission(stage, permissions, usersWithAccess);

        this.createMissingPermissions(stage, permissions, usersWithAccess);
    }

    private async updateOrDeleteExistingPermission(stage: NRStage,
                                                   permissions: drive_v3.Schema$Permission[],
                                                   usersWithAccess: UserWithAccess[]) {
        const emailToUserMap = new Map(usersWithAccess.map((user) => [user.email, user]));

        return await permissions
            .map(async (permission) => {
                const user = emailToUserMap.get(permission.emailAddress);

                if (!user) {
                    // User not in desired user list, delete permission
                    return await this.deletePermission(stage, permission.id);
                }

                if (user.access === Access.READ && permission.role === Role.READ ||
                    user.access === Access.WRITE && permission.role === Role.WRITE) {
                    // User is authorized correctly no changes needed
                    return;
                }

                return await this.updatePermission(stage, permission.id, user.access);
            });
    }

    private async createMissingPermissions(stage: NRStage,
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
                    await this.drive.permissions.create({
                        fileId: stage.googleDriveFolderId,
                        requestBody: permission,
                        sendNotificationEmail: false,
                    }, {
                        retry: true,
                        retryConfig: {
                            httpMethodsToRetry: ["POST"],
                            onRetryAttempt: (err) => {
                                console.log(err.message + ": attempt #" + err.config.retryConfig.currentRetryAttempt);
                            },
                            retry: 50,
                            retryDelay: 5000,
                            statusCodesToRetry: [[403], [429]],
                        },
                    });
                } catch (err) {
                    console.log("Error creating Google Doc permissions: " + err.message, err);
                }
            });
    }

    private async deletePermission(stage: NRStage,
                                   permissionId: string) {
        return await this.drive.permissions.delete({
            fileId: stage.googleDriveFolderId,
            permissionId,
        }, {
            retry: true,
            retryConfig: {
                httpMethodsToRetry: ["POST"],
                retry: 2,
                retryDelay: 1000,
                statusCodesToRetry: [[403, 429]],
            },
        });
    }

    private async updatePermission(stage: NRStage,
                                   permissionId: string,
                                   access: Access) {
        return await this.drive.permissions.update({
            fileId: stage.googleDriveFolderId,
            permissionId,
            requestBody: {
                role: Role.fromAccess(access),
            },
        });
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

        return admins.map((user) => {
            const userWithAccess = user as UserWithAccess;
            userWithAccess.access = Access.WRITE;
            return userWithAccess;
        });
    }

    private filterDuplicateUsers(users: UserWithAccess[]) {
        const emailToUserMap = new Map<string, UserWithAccess>();

        users.forEach((userWithAccess) => {
            const storedUser = emailToUserMap.get(userWithAccess.email);

            if (!storedUser || storedUser.access < userWithAccess.access) {
                emailToUserMap.set(userWithAccess.email, userWithAccess);
            }
        });

        return [...emailToUserMap.values()];
    }

    private getStageFolderName(stage: NRStage) {
        return "Newsroom - " + stage.workflow.name + " - " + stage.name;
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
