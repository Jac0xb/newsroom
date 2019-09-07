import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors } from "typescript-rest";
import { NRWorkflow } from "../entity";

@Service()
export class WorkflowService {
    @InjectRepository(NRWorkflow)
    private workflowRepository: Repository<NRWorkflow>;

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
}
