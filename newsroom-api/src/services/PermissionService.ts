import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import {
    DBConstants,
    NRDocument,
    NRRole,
    NRStage,
    NRSTPermission,
    NRUser,
    NRWFPermission,
    NRWorkflow,
} from "../entity";
import { UserService } from "./UserService";

@Service()
export class PermissionService {
    @InjectRepository(NRWFPermission)
    private wfPRep: Repository<NRWFPermission>;

    @InjectRepository(NRSTPermission)
    private stPRep: Repository<NRSTPermission>;

    @InjectRepository(NRStage)
    private stRep: Repository<NRStage>;

    @InjectRepository(NRWorkflow)
    private wfRep: Repository<NRWorkflow>;

    @InjectRepository(NRUser)
    private usRep: Repository<NRUser>;

    @Inject()
    private usServ: UserService;

    public async isUserAdmin(user: NRUser): Promise<boolean> {
        try {
            const res = await this.usRep.findOne(user.id);

            if (res.admin === "Y") {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            const errStr = `Unable to check admin privileges for user ${user.id}.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getAllAdmins(): Promise<NRUser[]> {
        return this.usRep.find({where: {admin: "Y"}});
    }

    public async getWFPermission(pid: number): Promise<NRWFPermission> {
        try {
            return await this.wfPRep.findOneOrFail(pid);
        } catch (err) {
            const errStr = `WF permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getWFPermissionFromWFRL(wf: NRWorkflow, rl: NRRole): Promise<NRWFPermission> {
        try {
            return await this.wfPRep.findOneOrFail({
                where: {
                    role: rl,
                    workflow: wf,
                },
            });
        } catch (NotFoundError) {
            const errStr = `WF permission with role ${rl.id} and WF ${wf.id} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getAllWFPermissionsForRole(rl: NRRole): Promise<NRWFPermission[]> {
        try {
            const res = await this.wfPRep.find({where: {role: rl}});

            if ((res === undefined) || (res.length === 0)) {
                throw new Errors.NotFoundError("Error getting WF permission.");
            }

            return res;
        } catch (err) {
            const errStr = `Error getting all WF permissions for role`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getSTPermission(pid: number): Promise<NRSTPermission> {
        try {
            return await this.stPRep.findOneOrFail(pid);
        } catch (err) {
            const errStr = `ST permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getSTPermissionFromSTRL(st: NRStage, rl: NRRole): Promise<NRSTPermission> {
        try {
            return await this.stPRep.findOneOrFail({
                where: {
                    role: rl,
                    stage: st,
                },
            });
        } catch (err) {
            const errStr = `ST permission with role ${rl.id} and ST ${st.id} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getAllSTPermissionsForRole(rl: NRRole): Promise<NRSTPermission[]> {
        try {
            const res = await this.stPRep.find({where: {role: rl}});

            if ((res === undefined) || (res.length === 0)) {
                throw new Errors.NotFoundError("Error getting WF permission.");
            }

            return res;
        } catch (err) {
            const errStr = `Error getting all stages for role.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // DONE.
    public async getWFPermForUser(wf: NRWorkflow, user: NRUser): Promise<number> {
        let allowed = false;

        if (await this.isUserAdmin(user)) {
            return DBConstants.WRITE;
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

        if (await this.isUserAdmin(user)) {
            return DBConstants.WRITE;
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
        const admin = await this.isUserAdmin(user);

        if ((!(allowed)) && (!(admin))) {
            const errStr = `User with ID ${user.id} does not have WF write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // DONE.
    public async checkSTWritePermissions(user: NRUser, st: NRStage) {
        const allowed = await this.getSTPermForUser(st, user);
        const admin = await this.isUserAdmin(user);

        if ((!(allowed)) && (!(admin))) {
            const errStr = `User with ID ${user.id} does not have ST write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    public async getAllStagePermissionsForStage(stage: NRStage) {
        return await this.stPRep.find({where: {stage}, relations: ["role"]});
    }
}
