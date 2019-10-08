import { google } from "googleapis";
import { Guid } from "guid-typescript";
import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { DBConstants, NRDCPermission, NRDocument, NRUser } from "../entity";
import { UserService } from "./UserService";

@Service()
export class DocumentService {
    private static readonly OAUTH_CREDS = {
        clientId: "153384745741-7h66ureoaag1j61ei5u6un0faeh4al5h.apps.googleusercontent.com",
        clientSecret: "u5Q2m0D1MO4DeulU-hCCHG06",
    };

    @InjectRepository(NRDocument)
    private documentRepository: Repository<NRDocument>;

    @InjectRepository(NRDCPermission)
    private permDCRepository: Repository<NRDCPermission>;

    @Inject()
    private userService: UserService;

    // DONE.
    public async getDocument(did: number): Promise<NRDocument> {
        try {
            return await this.documentRepository.findOneOrFail(did);
        } catch (err) {
            console.error("Error getting document:", err);

            const errStr = `Document with ID ${did} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Determine if a user has READ/WRITE on a document.
    public async getDocumentPermissionForUser(doc: NRDocument, user: NRUser): Promise<number> {
        const allRoles = await this.userService.getUserRoles(user.id);

        let allowed = false;

        for (const role of allRoles) {
            const roleRight = await this.permDCRepository
                .createQueryBuilder(DBConstants.DCPERM_TABLE)
                .select(`MAX(${DBConstants.DCPERM_TABLE}.access)`, "max")
                .where(`${DBConstants.DCPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${DBConstants.DCPERM_TABLE}.documentId = :dcid`, {dcid: doc.id})
                .getRawOne();

            if (roleRight.max === DBConstants.WRITE) {
                allowed = true;
                break;
            }
        }

        if (allowed) {
            return DBConstants.WRITE;
        } else {
            return DBConstants.READ;
        }
    }

    // Add permission field to a single doc.
    public async addPermissionsToDoc(doc: NRDocument, user: NRUser): Promise<NRDocument> {
        doc.permission = await this.getDocumentPermissionForUser(doc, user);
        return doc;
    }

    // Add permission field to many docs.
    public async addPermissionsToDocs(docs: NRDocument[], user: NRUser): Promise<NRDocument[]> {
        for (let doc of docs) {
            doc = await this.addPermissionsToDoc(doc, user);
        }

        return docs;
    }

    /**
     * Creates a Google Doc and returns the id
     */
    public async createGoogleDocument(user: NRUser, doc: NRDocument): Promise<string> {
        if (process.env.DOC_SKIP === "Y") {
            return Guid.create().toString();
        }

        const oAuth2Client = this.createOAuth2Client(user);

        const docs = google.docs({
            auth: oAuth2Client,
            version: "v1",
        });

        const result = await docs.documents.create({
            requestBody: {
                title: doc.name,
            },
        });

        return result.data.documentId;
    }

    /**
     * Updates the title of a Google Doc
     */
    public async updateGoogleDocumentTitle(user: NRUser, doc: NRDocument) {
        const oAuth2Client = this.createOAuth2Client(user);

        const drive = google.drive({
            auth: oAuth2Client,
            version: "v3",
        });

        await drive.files.update({
            fileId: doc.googleDocId,
            requestBody: {
                name: doc.name,
            },
        });
    }

    /**
     * Deletes a Google Doc by id
     */
    public async deleteGoogleDocument(user: NRUser, id: string) {
        const oAuth2Client = this.createOAuth2Client(user);

        const drive = google.drive({
            auth: oAuth2Client,
            version: "v3",
        });

        await drive.files.delete({
            fileId: id,
        });
    }

    private createOAuth2Client(user: NRUser) {
        const oAuth2Client = new google.auth.OAuth2(DocumentService.OAUTH_CREDS);

        oAuth2Client.setCredentials({
            access_token: user.accessToken,
        });

        return oAuth2Client;
    }
}
