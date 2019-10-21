import { Service } from "typedi";
import { Context, GET, Path, ServiceContext } from "typescript-rest";
import { Tags } from "typescript-rest-swagger";
import { NRUser } from "../entity";

// Provides API services for users.
@Service()
@Path("/api/currentUser")
@Tags("Current User")
export class CurrentUserResource {
    @Context
    private serviceContext: ServiceContext;

    /**
     * Get the user who is currently logged in.
     *
     * path:
     *      - None.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRUser with the following relations:
     *          - None.
     *
     */
    @GET
    public async getCurrentUser(): Promise<NRUser> {
        console.log("CALLED getCurrentUser");
        return this.serviceContext.user();
    }
}
