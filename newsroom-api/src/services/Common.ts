import { Repository } from "typeorm";
import { Errors, ServiceContext } from "typescript-rest";

import { NRUser } from "../entity";

// Common functionality used in different places.
export namespace common {
    export const READ = 0;
    export const WRITE = 1;
    export const USER_TABLE = "user";
    export const STGE_TABLE = "stage";
    export const ROLE_TABLE = "role";
    export const DOCU_TABLE = "document";
    export const WRKF_TABLE = "workflow";
    export const WFPERM_TABLE = "wfpermission";
    export const STPERM_TABLE = "stpermission";
    export const DCPERM_TABLE = "dcpermission";

    // Get the user from the ServiceContext containing the request.
    export function getUserFromContext(context: ServiceContext) {
        return context.request.user;
    }

    // Get a user based on ID.
    export async function getUser(uid: number,
                                  repo: Repository<NRUser>): Promise<NRUser> {
        try {
            return await repo.findOneOrFail(uid);
        } catch (err) {
            console.error("Error getting user:", err);

            const errStr = `User with ID ${uid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }
}
