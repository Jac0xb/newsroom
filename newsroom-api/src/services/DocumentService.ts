import { google } from "googleapis";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRDocument, NRUser } from "../entity";

@Service()
export class DocumentService {
    @InjectRepository(NRDocument)
    private documentRepository: Repository<NRDocument>;

    // Get a document based on ID.
    public async getDocument(did: number): Promise<NRDocument> {
        try {
            return await this.documentRepository.findOneOrFail(did);
        } catch (err) {
            console.error("Error getting document:", err);

            const errStr = `Document with ID ${did} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    /**
     * Creates a Google Doc and returns the id
     */
    public async createGoogleDocument(user: NRUser, doc: NRDocument): Promise<string> {
        const oAuth2Client = new google.auth.OAuth2({
            clientId: "153384745741-7h66ureoaag1j61ei5u6un0faeh4al5h.apps.googleusercontent.com",
            clientSecret: "u5Q2m0D1MO4DeulU-hCCHG06",
        });

        oAuth2Client.setCredentials({
            access_token: user.accessToken,
        });

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

}
