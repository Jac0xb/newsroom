import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";

import { DBConstants, NRDocument, NRStage, NRSTPermission, NRSTUSPermission,
         NRUser, NRWFPermission, NRWFUSPermission, NRWorkflow } from "../entity";
import { PermissionService } from "./PermissionService";
import { UserService } from "./UserService";

@Service()
export class WorkflowService {
    @InjectRepository(NRWorkflow)
    private workflowRepository: Repository<NRWorkflow>;

    @InjectRepository(NRStage)
    private stageRepository: Repository<NRStage>;

    @InjectRepository(NRWFPermission)
    private permWFRepository: Repository<NRWFPermission>;

    @InjectRepository(NRWFUSPermission)
    private wfUSRepository: Repository<NRWFUSPermission>;

    @InjectRepository(NRSTUSPermission)
    private stUSRepository: Repository<NRSTUSPermission>;

    @InjectRepository(NRSTPermission)
    private permSTRepository: Repository<NRSTPermission>;

    @InjectRepository(NRUser)
    private userRepository: Repository<NRUser>;

    @Inject()
    private userService: UserService;

    @Inject()
    private permissionService: PermissionService;

    public async getWorkflow(wid: number): Promise<NRWorkflow> {
        try {
            return await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting workflow:", err);

            const errStr = `Workflow with ID ${wid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    public async getStage(sid: number): Promise<NRStage> {
        try {
            const stage = await this.stageRepository.findOneOrFail(sid);

            return stage;
        } catch (err) {
            console.error("Error getting stage:", err);

            const errStr = `Stage with ID ${sid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    /**
     * Get all documents currently in a given workflow.
     *
     * wid: The primary key that identifies the workflow in question.
     * returns: An array of all documents in any of the workflow's stages.
     */
    public async getAllDocumentsInWorkflow(wid: number) {
        const wf = await this.getWorkflow(wid);
        const docs: NRDocument[] = [];

        // Accumulate all documents from all stages of the workflow.
        for (const st of wf.stages) {
            if (st.documents === undefined) {
                continue;
            }

            if (st.documents.length > 0) {
                docs.concat(st.documents);
            }
        }

        return docs;
    }

    /**
     * Append a 'permission' field to a single workflow.
     *
     * wf: The workflow in question.
     * user: The user in questions.
     * returns: The same workflow, but with the 'permission' field filled in.
     */
    public async appendPermToWF(wf: NRWorkflow, user: NRUser): Promise<NRWorkflow> {
        wf.permission = await this.permissionService.getWFPermForUser(wf, user);

        return wf;
    }

    /**
     * Append a 'permission' field to all passed.
     *
     * wfs: A list of workflows.
     * user: The user in question.
     * returns: The same workflows, but each with the 'permission' field filled in.
     */
    public async appendPermToWFS(wfs: NRWorkflow[], user: NRUser): Promise<NRWorkflow[]> {
        for (let wf of wfs) {
            wf = await this.appendPermToWF(wf, user);
        }

        return wfs;
    }

    /**
     * Determine if a user has READ/WRITE permissions on a stage.
     *
     * st: The stage in question.
     * user: The user in questions.
     * returns: One of WRITE or READ based on permissions of the user.
     */
    public async getStagePermissionForUser(st: NRStage, user: NRUser): Promise<number> {
        const allRoles = await this.userService.getUserRoles(user.id);

        // If any of the roles has WRITE permissions, stop looping and return.
        let allowed = false;

        // Get the 'highest' permissions over all roles the user is a part of.
        for (const role of allRoles) {
            const roleRight = await this.permSTRepository
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

        if (allowed) {
            return DBConstants.WRITE;
        } else {
            return DBConstants.READ;
        }
    }

    /**
     * Append a 'permission' field to a single stage.
     *
     * st: The stage in question.
     * user: The user in questions.
     * returns: The same stage, but with the 'permission' field filled in.
     */
    public async getPermissionsForST(st: NRStage, user: NRUser): Promise<NRStage> {
        st.permission = await this.getStagePermissionForUser(st, user);

        return st;
    }

    /**
     * Append a 'permission' field to many stage.
     *
     * stgs: A list of stages.
     * user: The user in question.
     * returns: The same stages, but each with the 'permission' field filled in.
     */
    public async getPermissionsForSTGS(stgs: NRStage[], user: NRUser): Promise<NRStage[]> {
        for (let st of stgs) {
            st = await this.getPermissionsForST(st, user);
        }

        return stgs;
    }

    public async createWFUSPermission(wid: number,
                                      user: NRUser,
                                      perm: number): Promise<NRWFUSPermission> {
        const wf = await this.getWorkflow(wid);

        const wfup = new NRWFUSPermission();
        wfup.workflow = wf;
        wfup.user = user;
        wfup.access = perm;

        await this.userRepository.save(user);
        await this.workflowRepository.save(wf);
        return await this.wfUSRepository.save(wfup);
    }

    public async createSTUSPermission(sid: number,
                                      user: NRUser,
                                      perm: number): Promise<NRSTUSPermission> {
        const st = await this.getStage(sid);

        const stup = new NRSTUSPermission();
        stup.stage = st;
        stup.user = user;
        stup.access = perm;

        await this.userRepository.save(user);
        await this.stageRepository.save(st);
        return await this.stUSRepository.save(stup);
    }
}
