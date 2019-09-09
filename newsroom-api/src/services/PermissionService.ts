import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRDCPermission, NRSTPermission, NRUser, NRWFPermission } from "../entity";
import { DBConstants } from "./DBConstants";
import { UserService } from "./UserService";

@Service()
export class PermissionService {
    @InjectRepository(NRWFPermission)
    private permWFRepository: Repository<NRWFPermission>;

    @InjectRepository(NRSTPermission)
    private permSTRepository: Repository<NRSTPermission>;

    @InjectRepository(NRDCPermission)
    private permDCRepository: Repository<NRDCPermission>;

    @Inject()
    private userService: UserService;

    // Get a workflow permission based on ID.
    public async getWFPermission(pid: number): Promise<NRWFPermission> {
        try {
            return await this.permWFRepository.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting WF permission:", err);

            const errStr = `WF permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a stage permission based on ID.
    public async getSTPermission(pid: number): Promise<NRSTPermission> {
        try {
            return await this.permSTRepository.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting ST permission:", err);

            const errStr = `ST permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a document permission based on ID.
    public async getDCPermission(pid: number): Promise<NRDCPermission> {
        try {
            return await this.permDCRepository.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting DC permission:", err);

            const errStr = `DC permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Check if a user has write permissions on a workflow.
    public async checkWFWritePermissions(user: NRUser, wid: number) {
        let allowed = false;

        user = await this.userService.getUser(user.id);

        try {
            if (!((user.roles === undefined) || (user.roles.length === 0))) {
                for (const role of user.roles) {
                    const roleRight = await this.permWFRepository
                        .createQueryBuilder(DBConstants.WFPERM_TABLE)
                        .select(`MAX(${DBConstants.WFPERM_TABLE}.access)`, "max")
                        .where(`${DBConstants.WFPERM_TABLE}.roleId = :id`, {id: role.id})
                        .andWhere(`${DBConstants.WFPERM_TABLE}.workflowId = :wfid`, {wfid: wid})
                        .getRawOne();

                    if (roleRight.max === DBConstants.WRITE) {
                        allowed = true;
                        break;
                    }
                }
            }
        } catch (err) {
            console.log(err);

            const errStr = `Error checking WF permissions.`;
            throw new Errors.InternalServerError(errStr);
        }

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have WF write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Check if a user has write permissions on a stage.
    public async checkSTWritePermissions(user: NRUser, sid: number) {
        let allowed = false;

        user = await this.userService.getUser(user.id);

        for (const role of user.roles) {
            const roleRight = await this.permSTRepository
                .createQueryBuilder(DBConstants.STPERM_TABLE)
                .select(`MAX(${DBConstants.STPERM_TABLE}.access)`, "max")
                .where(`${DBConstants.STPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${DBConstants.STPERM_TABLE}.stageId = :stid`, {stid: sid})
                .getRawOne();

            if (roleRight.max === DBConstants.WRITE) {
                allowed = true;
                break;
            }
        }

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have ST write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Check if a user has write permissions on a document.
    public async checkDCWritePermissions(user: NRUser, did: number) {
        let allowed = false;

        user = await this.userService.getUser(user.id);

        for (const role of user.roles) {
            const roleRight = await this.permDCRepository
                .createQueryBuilder(DBConstants.DCPERM_TABLE)
                .select(`MAX(${DBConstants.DCPERM_TABLE}.access)`, "max")
                .where(`${DBConstants.DCPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${DBConstants.DCPERM_TABLE}.documentId = :dcid`, {dcid: did})
                .getRawOne();

            if (roleRight.max === DBConstants.WRITE) {
                allowed = true;
                break;
            }
        }

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have DC write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }
}
