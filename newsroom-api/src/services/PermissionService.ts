import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRDCPermission, NRSTPermission, NRUser, NRWFPermission } from "../entity";
import { common } from "./Common";
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
                        .createQueryBuilder(common.WFPERM_TABLE)
                        .select(`MAX(${common.WFPERM_TABLE}.access)`, "max")
                        .where(`${common.WFPERM_TABLE}.roleId = :id`, {id: role.id})
                        .andWhere(`${common.WFPERM_TABLE}.workflowId = :wfid`, {wfid: wid})
                        .getRawOne();

                    if (roleRight.max === common.WRITE) {
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
                .createQueryBuilder(common.STPERM_TABLE)
                .select(`MAX(${common.STPERM_TABLE}.access)`, "max")
                .where(`${common.STPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${common.STPERM_TABLE}.stageId = :stid`, {stid: sid})
                .getRawOne();

            if (roleRight.max === common.WRITE) {
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
                .createQueryBuilder(common.DCPERM_TABLE)
                .select(`MAX(${common.DCPERM_TABLE}.access)`, "max")
                .where(`${common.DCPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${common.DCPERM_TABLE}.documentId = :dcid`, {dcid: did})
                .getRawOne();

            if (roleRight.max === common.WRITE) {
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
