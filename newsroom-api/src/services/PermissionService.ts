import { Recoverable } from "repl";
import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { InternalServerError } from "typescript-rest/dist/server/model/errors";
import { NRDCPermission, NRSTPermission, NRUser, NRWFPermission } from "../entity";
import { DBConstants } from "../entity";
import { UserService } from "./UserService";
import { WorkflowService } from "./WorkflowService";

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

    @Inject()
    private workflowService: WorkflowService;

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

    // Get a workflow permission based on WF and Role IDs.
    public async getWFPermissionFromWFRL(wid: number, rid: number): Promise<NRWFPermission> {
        try {
            return await this.permWFRepository
                .createQueryBuilder(DBConstants.WFPERM_TABLE)
                .where(`${DBConstants.WFPERM_TABLE}.roleId = :rd`, { rd: rid })
                .andWhere(`${DBConstants.WFPERM_TABLE}.workflowId = :wd`, { wd: wid })
                .getOne();
        } catch (err) {
            console.error("Error getting WF permission:", err);

            const errStr = `WF permission with role ${rid} and WF ${wid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getAllWFPermissionsForRole(rid: number): Promise<NRWFPermission[]> {
        try {
            return await this.permWFRepository
                .createQueryBuilder(DBConstants.WFPERM_TABLE)
                .where(`${DBConstants.WFPERM_TABLE}.roleId = :rd`, { rd: rid })
                .getMany();
        } catch (err) {
            console.error("Error getting WF permission:", err);

            const errStr = `Error getting all WF permissions for role ${rid}`;
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

    // Get a stage permission based on ST and Role IDs.
    public async getSTPermissionFromSTRL(sid: number, rid: number): Promise<NRSTPermission> {
        try {
            return await this.permSTRepository
                .createQueryBuilder(DBConstants.STPERM_TABLE)
                .where(`${DBConstants.STPERM_TABLE}.roleId = :rd`, { rd: rid })
                .andWhere(`${DBConstants.STPERM_TABLE}.stageId = :sd`, { sd: sid })
                .getOne();
        } catch (err) {
            console.error("Error getting ST permission:", err);

            const errStr = `ST permission with role ${rid} and ST ${sid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a stage permission based on ST and Role IDs.
    public async getAllSTPermissionsForRole(rid: number): Promise<NRSTPermission[]> {
        try {
            return await this.permSTRepository
                .createQueryBuilder(DBConstants.STPERM_TABLE)
                .where(`${DBConstants.STPERM_TABLE}.roleId = :rd`, { rd: rid })
                .getMany();
        } catch (err) {
            console.error("Error getting ST permission:", err);

            const errStr = `Error getting all stages for role ${rid}.`;
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

    // Return if user had READ/WRITE on a workflow.
    public async getWFWritePermission(user: NRUser, wid: number): Promise<number> {
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

        if (allowed) {
            return DBConstants.WRITE;
        } else {
            return DBConstants.READ;
        }
    }

    // Check if a user has write permissions on a workflow.
    public async checkWFWritePermissions(user: NRUser, wid: number) {
        const allowed = await this.getWFWritePermission(user, wid);

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have WF write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Return if user had READ/WRITE on a stage.
    public async getSTWritePermission(user: NRUser, sid: number): Promise<number> {
        let allowed = false;
        const stge = await this.workflowService.getStage(sid);
        const rw = await this.getWFWritePermission(user, stge.workflow.id);

        // Can edit stages if they have permission on the workflow.
        // TODO: What about moving documents?
        if (rw === DBConstants.WRITE) {
            return rw;
        }

        user = await this.userService.getUser(user.id);
        console.log(`PermissionService.getSTWritePermission, action=got user, user_id=${user.id}`);

        try {
            if (!((user.roles === undefined) || (user.roles.length === 0))) {
                for (const role of user.roles) {
                    console.log(`PermissionService.getSTWritePermission, action=looking at role,
                    role_name=${role.name}`);
                    const roleRight = await this.permSTRepository
                        .createQueryBuilder(DBConstants.STPERM_TABLE)
                        .select(`MAX(${DBConstants.STPERM_TABLE}.access)`, "max")
                        .where(`${DBConstants.STPERM_TABLE}.roleId = :id`, {id: role.id})
                        .andWhere(`${DBConstants.STPERM_TABLE}.stageId = :stid`, {stid: sid})
                        .getRawOne();

                    console.log(`PermissionService.getSTWritePermission, action=look at max, role=${role.id}, stage=${sid}`);

                    if (roleRight.max === DBConstants.WRITE) {
                        console.log(`PermissionService.getSTWritePermission, action=break,
                        reason=has write permissions`);
                        allowed = true;
                        break;
                    }

                    console.log(`PermissionService.getSTWritePermission, action=continue, reason=has read permissions`);
                }
            }
        } catch (err) {
            const errStr = `Error while getting ST write permissions for stage ${sid}.`;

            console.log(errStr);
            console.log(err);
            throw new InternalServerError(errStr);
        }

        if (allowed) {
            return DBConstants.WRITE;
        } else {
            return DBConstants.READ;
        }
    }

    // Check if a user has write permissions on a stage.
    public async checkSTWritePermissions(user: NRUser, sid: number) {
        const allowed = this.getSTWritePermission(user, sid);

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have ST write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Check if a user has write permissions on a document.
    public async checkDCWritePermission(user: NRUser, did: number): Promise<number> {
        return DBConstants.WRITE;
        // let allowed = false;

        // user = await this.userService.getUser(user.id);

        // for (const role of user.roles) {
        //     const roleRight = await this.permDCRepository
        //         .createQueryBuilder(DBConstants.DCPERM_TABLE)
        //         .select(`MAX(${DBConstants.DCPERM_TABLE}.access)`, "max")
        //         .where(`${DBConstants.DCPERM_TABLE}.roleId = :id`, {id: role.id})
        //         .andWhere(`${DBConstants.DCPERM_TABLE}.documentId = :dcid`, {dcid: did})
        //         .getRawOne();

        //     if (roleRight.max === DBConstants.WRITE) {
        //         allowed = true;
        //         break;
        //     }
        // }
    }

    // Check if a user has write permissions on a document.
    public async checkDCWritePermissions(user: NRUser, did: number) {
        const allowed = this.checkDCWritePermission(user, did);

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have DC write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }
}
