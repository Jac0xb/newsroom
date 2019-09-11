import { ServiceContext } from "typescript-rest/dist/server/model/server-types";
import { NRUser } from "./entity";

/**
 * Add a type extension to the ServiceContext type.
 */
declare module "typescript-rest/dist/server/model/server-types" {
    interface ServiceContext {
        user(): NRUser;
    }
}

/**
 * Add the implementation of ServiceContext#user to the object prototype.
 *
 * Note: This method needs to be called in the app.
 */
export function extendServiceContext() {
    ServiceContext.prototype.user = function(this: ServiceContext) {
        return this.request.user;
    };
}
