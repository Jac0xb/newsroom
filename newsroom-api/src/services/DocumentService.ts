import { google } from "googleapis";
import { Guid } from "guid-typescript";
import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRDocument, NRStage, NRUser } from "../entity";
import { PermissionService } from "./PermissionService";

@Service()
export class DocumentService {
    private static readonly OAUTH_CREDS = {
        clientId: "153384745741-7h66ureoaag1j61ei5u6un0faeh4al5h.apps.googleusercontent.com",
        clientSecret: "u5Q2m0D1MO4DeulU-hCCHG06",
    };

    @InjectRepository(NRDocument)
    private dcRep: Repository<NRDocument>;

    @Inject()
    private permServ: PermissionService;

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
            const dcwst = await this.dcRep.findOne(dc.id, { relations: ["stage"] });
            await this.appendPermToDC(dc, dcwst.stage, usr);
        }
    }

    public async createGoogleDocument(user: NRUser, doc: NRDocument): Promise<string> {
        if (process.env.DO_GOOGLE === "N") {
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

    public async updateGoogleDocumentTitle(user: NRUser, doc: NRDocument) {
        if (process.env.DO_GOOGLE === "N") {
            return;
        }

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
