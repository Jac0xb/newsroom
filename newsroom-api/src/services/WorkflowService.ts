import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRStage, NRWorkflow } from "../entity";

@Service()
export class WorkflowService {
    @InjectRepository(NRWorkflow)
    private workflowRepository: Repository<NRWorkflow>;

    @InjectRepository(NRStage)
    private stageRepository: Repository<NRStage>;

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
}
