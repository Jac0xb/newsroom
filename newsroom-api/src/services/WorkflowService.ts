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
    private permissionService: PermissionService;

    // DONE.
    public async getWorkflow(wid: number): Promise<NRWorkflow> {
        try {
            return await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error(`getWorkflow error: ${err}`);

            const errStr = `Error getting workflow with ID=${wid}.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // DONE.
    public async addStageRelationsToWF(wf: NRWorkflow): Promise<NRWorkflow> {
        try {
            return await this.workflowRepository.findOne(wf.id, { relations: ['stages'] });
        } catch (err) {
            console.error(`addStageRelationsToWF error: ${err}`);

            const errStr = `Error loading relations for workflow with ID=${wf.id}.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    // DONE.
    public async addStageRelationsToWFS(wfs: NRWorkflow[]): Promise<NRWorkflow[]> {
        try {
            for (let i = 0; i < wfs.length; i++) {
                wfs[i] = await this.addStageRelationsToWF(wfs[i]);
            }

            return wfs;
        } catch (err) {
            console.error(`addStageRelationsToWFS error: ${err}`);

            const errStr = `Error loading relations for workflows.`;
            throw new Errors.InternalServerError(errStr);
        }
    }
 
    // DONE.
    public async appendPermToWF(wf: NRWorkflow, user: NRUser): Promise<NRWorkflow> {
        wf.permission = await this.permissionService.getWFPermForUser(wf, user);

        return wf;
    }

    // DONE.
    public async appendPermToWFS(wfs: NRWorkflow[], user: NRUser): Promise<NRWorkflow[]> {
        for (let wf of wfs) {
            wf = await this.appendPermToWF(wf, user);
        }

        return wfs;
    }

    // DONE.
    public async appendPermToST(st: NRStage, user: NRUser): Promise<NRStage> {
        st.permission = await this.permissionService.getSTPermForUser(st, user);

        return st;
    }

    // DONE.
    public async appendPermToSTS(stgs: NRStage[], user: NRUser): Promise<NRStage[]> {
        for (let st of stgs) {
            st = await this.appendPermToST(st, user);
        }

        return stgs;
    }

    // DONE.
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

    // DONE.
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

    public async getMaxStageSequenceId(wf: NRWorkflow): Promise<number> {
        const maxSeq = await this.stageRepository
            .createQueryBuilder(DBConstants.STGE_TABLE)
            .select("MAX(stage.sequenceId)", "max")
            .where("stage.workflowId = :id", {id: wf.id})
            .getRawOne();

        return maxSeq.max;
    }
}
