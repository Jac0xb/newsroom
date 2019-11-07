import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Errors, GET, Path, POST, PreProcessor, PUT } from "typescript-rest";
import { Tags } from "typescript-rest-swagger";
import { NRTrigger } from "../entity";
import { DocumentService } from "../services/DocumentService";
import { WorkflowService } from "../services/WorkflowService";
import { createTriggerValidator, updateTriggerValidator } from "../validators/TriggerValidators";

@Service()
@Path("/api/triggers")
@Tags("Triggers")
export class TriggerResource {
    @InjectRepository(NRTrigger)
    private triggerRepository: Repository<NRTrigger>;

    @Inject()
    private documentService: DocumentService;

    @Inject()
    private workflowService: WorkflowService;

    @GET
    public async getAllTriggers(): Promise<NRTrigger[]> {
        console.log("CALLED getAllTriggers");

        return this.triggerRepository.find();
    }

    /**
     *  Required params: trigger.name: string, trigger.type: string ("NRSlackTrigger", "NREmailTrigger)
     *
     *  Optional params: trigger.workflows: [{id: number}], trigger.documents: [{id: number}]
     *
     *  SubTypes:
     *  Slack Trigger required params: trigger.channelName: string
     *
     * @param trigger The new trigger.
     */
    @POST
    @PreProcessor(createTriggerValidator)
    public async createNewTrigger(trigger: NRTrigger): Promise<NRTrigger> {
        console.log("CALLED createNewTrigger");

        await this.validateTriggerDocumentsAndWorkflows(trigger);

        return await this.triggerRepository.save(trigger);
    }

    /**
     *  Required params: trigger.name: string, ?type={slack}
     *
     *  Optional params: trigger.workflows: [{id: number}], trigger.documents: [{id: number}]
     *
     *  SubTypes:
     *  Slack Trigger required params: trigger.channelName: string
     *
     * @param trigger The new trigger.
     */
    @PUT
    @PreProcessor(updateTriggerValidator)
    public async updateTrigger(trigger: NRTrigger): Promise<NRTrigger> {
        console.log("CALLED updateTrigger");

        await this.validateTriggerDocumentsAndWorkflows(trigger);

        const currentTrigger = await this.findTrigger(trigger.id);

        if (trigger.name) {
            currentTrigger.name = trigger.name;
        }

        if (trigger.channelName) {
            currentTrigger.channelName = trigger.channelName;
        }

        if (trigger.documents) {
            currentTrigger.documents.concat(trigger.documents);
        }

        if (trigger.workflows) {
            currentTrigger.workflows.concat(trigger.workflows);
        }

        return await this.triggerRepository.save(trigger);
    }

    private async findTrigger(id: number): Promise<NRTrigger> {
        try {
            return await this.triggerRepository.findOneOrFail(id);
        } catch (err) {
            console.error("Error getting trigger:", err);
            throw new Errors.NotFoundError(`Trigger with id ${id} not found.`);
        }
    }

    private validateTriggerDocumentsAndWorkflows(trigger: NRTrigger) {
        return Promise.all([
            this.validateTriggerDocumentsIfPresent(trigger),
            this.validateTriggerWorkflowsIfPresent(trigger),
        ]);
    }

    private validateTriggerDocumentsIfPresent(trigger: NRTrigger) {
        if (trigger.documents) {
            return this.validateTriggerItems(trigger.documents, (id) => {
                return this.documentService.getDocument(id);
            });
        }
    }

    private validateTriggerWorkflowsIfPresent(trigger: NRTrigger) {
        if (trigger.workflows) {
            return this.validateTriggerItems(trigger.workflows, (id) => {
                return this.workflowService.getWorkflow(id);
            });
        }
    }

    private validateTriggerItems<T extends { id: number }>(items: T[], getFunc: (id: number) => Promise<T>) {
        return Promise.all(items
            .map((item) => item.id)
            .map((id) => {
                return getFunc(id);
            }));
    }
}
