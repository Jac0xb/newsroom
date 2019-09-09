import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context, Errors, ServiceContext } from "typescript-rest";
import { NRUser } from "../entity";

@Service()
export class UserService {
    @Context
    private context: ServiceContext;

    @InjectRepository(NRUser)
    private repository: Repository<NRUser>;

    // Get the user from the ServiceContext containing the request.
    public getUserFromContext() {
        return this.context.request.user;
    }

    // Get a user based on ID.
    public async getUser(uid: number): Promise<NRUser> {
        try {
            return await this.repository.findOneOrFail(uid);
        } catch (err) {
            console.error("Error getting user:", err);

            const errStr = `User with ID ${uid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }
}
