import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { DELETE, Errors, GET, Path, POST, PreProcessor, PUT } from "typescript-rest";
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
     *  Required params: trigger.type: string ("NRSlackTrigger"), channelName: string
     *
     *  Optional params: trigger.workflows: [{id: number}], trigger.documents: [{id: number}]
     *                   trigger.stages: [{id: number}]
     *
     * @param trigger The new trigger.
     */
    @POST
    @PreProcessor(createTriggerValidator)
    public async createNewTrigger(trigger: NRTrigger): Promise<NRTrigger> {
        console.log("CALLED createNewTrigger");

        await this.validateTriggerWFSTDC(trigger);

        return await this.triggerRepository.save(trigger);
    }

    /**
     *  Required params: trigger.type: string ("NRSlackTrigger"), channelName: string
     *
     *  Optional params: trigger.workflows: [{id: number}], trigger.documents: [{id: number}]
     *                   trigger.stages: [{id: number}]
     *
     * @param trigger The new trigger.
     */
    @PUT
    @PreProcessor(updateTriggerValidator)
    public async updateTrigger(trigger: NRTrigger): Promise<NRTrigger> {
        console.log("CALLED updateTrigger");

        await this.validateTriggerWFSTDC(trigger);

        const currentTrigger = await this.findTrigger(trigger.id);

        if (trigger.channelName) {
            currentTrigger.channelName = trigger.channelName;
        }

//        if (trigger.document) {
//            currentTrigger.document = trigger.document;
//        }
//
//        if (trigger.workflow) {
//            currentTrigger.workflow = trigger.workflow;
//        }
//
//        if (trigger.stage) {
//            currentTrigger.stage = trigger.stage;
//        }

        return await this.triggerRepository.save(trigger);
    }

    @DELETE
    public async deleteTrigger(trigger: NRTrigger) {
        console.log("CALLED deleteTrigger");

        await this.triggerRepository.remove(trigger);
    }

    private async findTrigger(id: number): Promise<NRTrigger> {
        try {
            return await this.triggerRepository.findOneOrFail(id);
        } catch (err) {
            console.error("Error getting trigger:", err);
            throw new Errors.NotFoundError(`Trigger with id ${id} not found.`);
        }
    }

    private async validateTriggerWFSTDC(trigger: NRTrigger) {
        return Promise.all([
            this.validateTriggerDocumentIfPresent(trigger),
            this.validateTriggerWorkflowIfPresent(trigger),
            this.validateTriggerStageIfPresent(trigger),
        ]);
    }

    private async validateTriggerDocumentIfPresent(trigger: NRTrigger) {
        if (trigger.document) {
            trigger.document = await this.documentService.getDocument(trigger.document.id);
        }
    }

    private async validateTriggerWorkflowIfPresent(trigger: NRTrigger) {
        if (trigger.workflow) {
            trigger.workflow = await this.workflowService.getWorkflow(trigger.workflow.id);
        }
    }

    private async validateTriggerStageIfPresent(trigger: NRTrigger) {
        if (trigger.stage) {
            trigger.stage = await this.workflowService.getStage(trigger.stage.id);
        }
    }
}
