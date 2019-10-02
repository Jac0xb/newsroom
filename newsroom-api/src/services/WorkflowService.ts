import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { DBConstants, NRStage, NRSTPermission, NRUser, NRWFPermission, NRWorkflow, NRDocument } from "../entity";
import { UserService } from "./UserService";

@Service()
export class WorkflowService {
    @InjectRepository(NRWorkflow)
    private workflowRepository: Repository<NRWorkflow>;

    @InjectRepository(NRStage)
    private stageRepository: Repository<NRStage>;

    @InjectRepository(NRWFPermission)
    private permWFRepository: Repository<NRWFPermission>;

    @InjectRepository(NRSTPermission)
    private permSTRepository: Repository<NRSTPermission>;

    @Inject()
    private userService: UserService;

    /**
     * Get a workflow based on ID.
     * 
     * wid: The primary key for the workflow in question.
     * returns: The NRWorkflow based on 'wid'.
     */
    public async getWorkflow(wid: number): Promise<NRWorkflow> {
        try {
            return await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting workflow:", err);

            const errStr = `Workflow with ID ${wid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    /**
     * Get a stage based on ID.
     * 
     * sid: The primary key for the stage in question.
     * returns: The NRStage based on 'sid'.
     */
    public async getStage(sid: number): Promise<NRStage> {
        try {
            // Get the workflow ID that this stage is a part of.
            const st = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .select("workflowId", "val")
                .where(`${DBConstants.STGE_TABLE}.id = :s`, { s: sid })
                .getRawOne();

            // Can't have an 'eager' relationship both ways, so grab the workflow object
            // manually and attach it to the returned stage.
            const wf = await this.workflowRepository.findOne({ where: { id: st.val }});
            const stage = await this.stageRepository.findOneOrFail(sid);
            stage.workflow = wf;

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
        for (let st of wf.stages) {
            if (st.documents === undefined) {
                continue;
            }

            if (st.documents.length > 0) {
                docs.concat(st.documents);
            }
        }

        return docs;
    }

    // Determine if a user has READ/WRITE on a workflow.
    /**
     * Determine what permissions a user has for a given workflow.
     * 
     * This is based on all of the roles that a user is part of, and the
     * highest resulting permission is returned.
     * 
     * wf: The workflow in question.
     * user: The user in question.
     * returns: One of WRITE or READ based on the users permission level.
     */
    public async getWorkflowPermissionForUser(wf: NRWorkflow, user: NRUser): Promise<number> {
        const allRoles = await this.userService.getUserRoles(user.id);

        // If any of the roles has WRITE permissions, stop looping and return.
        let allowed = false;

        // Get the 'highest' permissions over all roles the user is a part of.
        for (const role of allRoles) {
            const roleRight = await this.permWFRepository
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

        if (allowed) {
            return DBConstants.WRITE;
        } else {
            return DBConstants.READ;
        }
    }

    /**
     * Append a 'permission' field to a single workflow.
     * 
     * wf: The workflow in question.
     * user: The user in questions.
     * returns: The same workflow, but with the 'permission' field filled in.
     */
    public async getPermissionsForWF(wf: NRWorkflow, user: NRUser): Promise<NRWorkflow> {
        wf.permission = await this.getWorkflowPermissionForUser(wf, user);

        return wf;
    }

    /**
     * Append a 'permission' field to all passed.
     * 
     * wfs: A list of workflows.
     * user: The usern question.
     * returns: The same workflows, but each with the 'permission' field filled in.
     */
    public async getPermissionsForWFS(wfs: NRWorkflow[], user: NRUser): Promise<NRWorkflow[]> {
        for (let wf of wfs) {
            wf = await this.getPermissionsForWF(wf, user);
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

}
