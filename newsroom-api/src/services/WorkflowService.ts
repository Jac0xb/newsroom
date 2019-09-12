import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { DBConstants, NRStage, NRSTPermission, NRUser, NRWFPermission, NRWorkflow} from "../entity";
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

    // Get a workflow based on ID.
    public async getWorkflow(wid: number): Promise<NRWorkflow> {
        try {
            return await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting workflow:", err);

            const errStr = `Workflow with ID ${wid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a stage based on ID.
    public async getStage(sid: number): Promise<NRStage> {
        try {
            return await this.stageRepository.findOneOrFail(sid);
        } catch (err) {
            console.error("Error getting stage:", err);

            const errStr = `Stage with ID ${sid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Determine if a user has READ/WRITE on a workflow.
    public async getWorkflowPermissionForUser(wf: NRWorkflow, user: NRUser): Promise<number> {
        const allRoles = await this.userService.getUserRoles(user.id);

        let allowed = false;

        for (const role of allRoles) {
            const roleRight = await this.permWFRepository
                .createQueryBuilder(DBConstants.WFPERM_TABLE)
                .select(`MAX(${DBConstants.WFPERM_TABLE}.access)`, "max")
                .where(`${DBConstants.WFPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${DBConstants.WFPERM_TABLE}.workflowId = :wfid`, {wfid: wf.id})
                .getRawOne();

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

    // Add permission field to a single workflow.
    public async addPermissionsToWF(wf: NRWorkflow, user: NRUser): Promise<NRWorkflow> {
        wf.permission = await this.getWorkflowPermissionForUser(wf, user);
        return wf;
    }

    // Add permission field to many workflows.
    public async addPermissionsToWFS(wfs: NRWorkflow[], user: NRUser): Promise<NRWorkflow[]> {
        for (let wf of wfs) {
            wf = await this.addPermissionsToWF(wf, user);
        }

        return wfs;
    }

    // Determine if a user has READ/WRITE on a stage.
    public async getStagePermissionForUser(st: NRStage, user: NRUser): Promise<number> {
        const allRoles = await this.userService.getUserRoles(user.id);

        let allowed = false;

        for (const role of allRoles) {
            const roleRight = await this.permWFRepository
                .createQueryBuilder(DBConstants.STPERM_TABLE)
                .select(`MAX(${DBConstants.STPERM_TABLE}.access)`, "max")
                .where(`${DBConstants.STPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${DBConstants.STPERM_TABLE}.stageId = :stid`, {stid: st.id})
                .getRawOne();

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

    // Add permission field to a single stage.
    public async addPermissionsToST(st: NRStage, user: NRUser): Promise<NRStage> {
        st.permission = await this.getStagePermissionForUser(st, user);
        return st;
    }

    // Add permission field to many stage.
    public async addPermissionsToStages(stgs: NRStage[], user: NRUser): Promise<NRStage[]> {
        for (let st of stgs) {
            st = await this.addPermissionsToST(st, user);
        }

        return stgs;
    }

}
