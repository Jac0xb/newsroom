import { GET, Path } from "typescript-rest";

@Path("/")
export class DocumentService {
    @GET
    public getDocuments(): string {
        return "ok";
    }

}
