import { Recoverable } from "repl";
import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { InternalServerError } from "typescript-rest/dist/server/model/errors";
import { NRDCPermission, NRDocument, NRRole, NRStage,
         NRSTPermission, NRSTUSPermission, NRUser, NRWFPermission, NRWFUSPermission, NRWorkflow } from "../entity";
import { DBConstants } from "../entity";
import { UserService } from "./UserService";
import { WorkflowService } from "./WorkflowService";

@Service()
export class PermissionService {
    @InjectRepository(NRWFPermission)
    private wfPRep: Repository<NRWFPermission>;

    @InjectRepository(NRSTPermission)
    private stPRep: Repository<NRSTPermission>;

    @InjectRepository(NRDCPermission)
    private dcPRep: Repository<NRDCPermission>;

    @InjectRepository(NRUser)
    private usRep: Repository<NRUser>;

    @InjectRepository(NRWFUSPermission)
    private wfUSRep: Repository<NRWFUSPermission>;

    @InjectRepository(NRSTUSPermission)
    private stUSRep: Repository<NRSTUSPermission>;

    @Inject()
    private usServ: UserService;

    public async getWFPermission(pid: number): Promise<NRWFPermission> {
        try {
            return await this.wfPRep.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting WF permission:", err);

            const errStr = `WF permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getWFPermissionFromWFRL(wf: NRWorkflow, rl: NRRole): Promise<NRWFPermission> {
        try {
            return await this.wfPRep.findOneOrFail({ where: { role: rl,
                                                              workflow: wf } });
        } catch (NotFoundError) {
            const errStr = `WF permission with role ${rl.id} and WF ${wf.id} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getAllWFPermissionsForRole(rid: number): Promise<NRWFPermission[]> {
        try {
            return await this.wfPRep
                .createQueryBuilder(DBConstants.WFPERM_TABLE)
                .where(`${DBConstants.WFPERM_TABLE}.roleId = :rd`, { rd: rid })
                .getMany();
        } catch (err) {
            console.error("Error getting WF permission:", err);

            const errStr = `Error getting all WF permissions for role ${rid}`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getSTPermission(pid: number): Promise<NRSTPermission> {
        try {
            return await this.stPRep.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting ST permission:", err);

            const errStr = `ST permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getSTPermissionFromSTRL(sid: number, rid: number): Promise<NRSTPermission> {
        try {
            return await this.stPRep
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

    public async getAllSTPermissionsForRole(rid: number): Promise<NRSTPermission[]> {
        try {
            return await this.stPRep
                .createQueryBuilder(DBConstants.STPERM_TABLE)
                .where(`${DBConstants.STPERM_TABLE}.roleId = :rd`, { rd: rid })
                .getMany();
        } catch (err) {
            console.error("Error getting ST permission:", err);

            const errStr = `Error getting all stages for role ${rid}.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getDCPermission(pid: number): Promise<NRDCPermission> {
        try {
            return await this.dcPRep.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting DC permission:", err);

            const errStr = `DC permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // DONE.
    public async getWFPermForUser(wf: NRWorkflow, user: NRUser): Promise<number> {
        let allowed = false;

        // Check user permissions first.
        const usdb = await this.usRep.findOne(user.id, { relations: ["wfpermissions"] });

        if (usdb !== undefined) {
            for (const wfup of usdb.wfpermissions) {
                const wfupdb = await this.wfUSRep.findOne(wfup.id, { relations: ["workflow"] });

                if ((wfupdb.workflow.id === wf.id) && (wfupdb.access === DBConstants.WRITE)) {
                    allowed = true;
                    break;
                }
            }
        }

        const allRoles = await this.usServ.getUserRoles(user.id);

        // Now check all roles.
        if ((!allowed) && (allRoles !== undefined)) {
            // Get the 'highest' permissions over all roles the user is a part of.
            for (const role of allRoles) {
                const roleRight = await this.wfPRep
                    .createQueryBuilder(DBConstants.WFPERM_TABLE)
                    .select(`MAX(${DBConstants.WFPERM_TABLE}.access)`, "max")
                    .where(`${DBConstants.WFPERM_TABLE}.roleId = :id`, {id: role.id})
                    .andWhere(`${DBConstants.WFPERM_TABLE}.workflowId = :wfid`, {wfid: wf.id})
                    .getRawOne();

                // Found one with WRITE, so just return now.
                if (roleRight.max === DBConstants.WRITE) {
                    allowed = true;
                    break;
                }
            }
        }

        if (allowed) {
            return DBConstants.WRITE;
        } else {
            return DBConstants.READ;
        }
    }

    // DONE.
    public async getSTPermForUser(st: NRStage, user: NRUser): Promise<number> {
        let allowed = false;

        // Check user permissions first.
        const usdb = await this.usRep.findOne(user.id, { relations: ["stpermissions"] });

        if (usdb !== undefined) {
            for (const stup of usdb.stpermissions) {
                const stupdb = await this.stUSRep.findOne(stup.id, { relations: ["stage"] });

                if ((stupdb.stage.id === st.id) && (stupdb.access === DBConstants.WRITE)) {
                    allowed = true;
                    break;
                }
            }
        }

        const allRoles = await this.usServ.getUserRoles(user.id);

        // Now check all roles.
        if ((!allowed) && (allRoles !== undefined)) {
            // Get the 'highest' permissions over all roles the user is a part of.
            for (const role of allRoles) {
                const roleRight = await this.stPRep
                   .createQueryBuilder(DBConstants.STPERM_TABLE)
                   .select(`MAX(${DBConstants.STPERM_TABLE}.access)`, "max")
                   .where(`${DBConstants.STPERM_TABLE}.roleId = :id`, {id: role.id})
                   .andWhere(`${DBConstants.STPERM_TABLE}.stageId = :stid`, {stid: st.id})
                   .getRawOne();

                // Found one with WRITE, so just return now.
                if (roleRight.max === DBConstants.WRITE) {
                    allowed = true;
                    break;
                }
            }
        }

        if (allowed) {
            return DBConstants.WRITE;
        } else {
            return DBConstants.READ;
        }
    }

    // DONE.
    public async getDCPermForUser(dc: NRDocument, st: NRStage, usr: NRUser) {
        return await this.getSTPermForUser(st, usr);
    }

    // DONE.
    public async checkWFWritePermissions(user: NRUser, wf: NRWorkflow) {
        const allowed = await this.getWFPermForUser(wf, user);

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have WF write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // DONE.
    public async checkSTWritePermissions(user: NRUser, st: NRStage) {
        const allowed = await this.getSTPermForUser(st, user);

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have ST write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }
}
