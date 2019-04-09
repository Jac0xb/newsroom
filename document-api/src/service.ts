import { Document } from "orm";
import { getManager } from "typeorm";
import { GET, Path } from "typescript-rest";

@Path("/")
export class DocumentService {
    public documentRepository = getManager().getRepository(Document);

    @GET
    public getDocuments(): Promise<any> {
        return this.documentRepository.find();
    }
}
