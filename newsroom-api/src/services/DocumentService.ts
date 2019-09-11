import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRDocument } from "../entity";

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
}
