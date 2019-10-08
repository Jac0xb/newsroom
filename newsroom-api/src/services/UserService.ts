import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRRole, NRUser } from "../entity";
import { DBConstants } from "../entity";

@Service()
export class UserService {
    @InjectRepository(NRUser)
    private repository: Repository<NRUser>;

    public async getUser(uid: number): Promise<NRUser> {
        try {
            return await this.repository.findOneOrFail(uid);
        } catch (err) {
            console.error("Error getting user:", err);

            const errStr = `User with ID ${uid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getUserRoles(uid: number): Promise<NRRole[]> {
        const user = await this.repository.findOneOrFail(uid, { relations: ["roles"] });
        return user.roles;
    }
}
