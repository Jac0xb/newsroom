import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRRole } from "../entity";

@Service()
export class RoleService {
    @InjectRepository(NRRole)
    private repository: Repository<NRRole>;

    // Get a role based on ID.
    public async getRole(rid: number): Promise<NRRole> {
        try {
            return await this.repository.findOneOrFail(rid);
        } catch (err) {
            console.error("Error getting role:", err);

            const errStr = `Role with ID ${rid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }
}
