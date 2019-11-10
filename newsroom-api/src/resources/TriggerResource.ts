import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context, DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT, ServiceContext } from "typescript-rest";
import { Tags } from "typescript-rest-swagger";
import { NRStage, NRTrigger } from "../entity";
import { DocumentService } from "../services/DocumentService";
import { PermissionService } from "../services/PermissionService";
import { WorkflowService } from "../services/WorkflowService";
import { createTriggerValidator, updateTriggerValidator } from "../validators/TriggerValidators";

@Service()
@Path("/api/triggers")
@Tags("Triggers")
export class TriggerResource {
    @Context
    private servCont: ServiceContext;

    @InjectRepository(NRTrigger)
    private triggerRepository: Repository<NRTrigger>;

    @InjectRepository(NRStage)
    private stRep: Repository<NRStage>;

    @Inject()
    private documentService: DocumentService;

    @Inject()
    private wfServ: WorkflowService;

    @Inject()
    private permServ: PermissionService;

    @GET
    public async getAllTriggers(): Promise<NRTrigger[]> {
        console.log("CALLED getAllTriggers");

        return this.triggerRepository.find();
    }

    @GET
    @Path("/:sid")
    public async getTrigger(@PathParam("sid") sid: number): Promise<NRTrigger> {
        console.log("CALLED getTrigger");

        // Verify stage exists.
        await this.wfServ.getStage(sid);

        const st = await this.stRep.findOne(sid, { relations: ["trigger"] });

        if (st.trigger === null) {
            return undefined;
        }

        return st.trigger;
    }

    /**
     *  Required params: trigger.type: string ("NRSlackTrigger"), channelName: string
     *                   trigger.stage: NRStage
     *
     * @param trigger The new trigger.
     */
    @POST
    @Path("/:sid")
    @PreProcessor(createTriggerValidator)
    public async createNewTrigger(@PathParam("sid") sid: number, trigger: NRTrigger): Promise<NRTrigger> {
        console.log("CALLED createNewTrigger");

        const user = await this.servCont.user();
        await this.wfServ.getStage(sid);

        const st = await this.stRep.findOne(sid, { relations: ["workflow"] });
        await this.permServ.checkWFWritePermissions(user, st.workflow);

        trigger.stage = st;

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
    @Path("/:sid")
    @PreProcessor(updateTriggerValidator)
    public async updateTrigger(@PathParam("sid") sid: number, trigger: NRTrigger): Promise<NRTrigger> {
        console.log("CALLED updateTrigger");

        const user = await this.servCont.user();
        await this.wfServ.getStage(sid);

        const st = await this.stRep.findOne(sid, { relations: ["workflow"] });
        await this.permServ.checkWFWritePermissions(user, st.workflow);

        const currentTrigger = await this.findTrigger(trigger.id);

        if (trigger.channelName) {
            currentTrigger.channelName = trigger.channelName;
        }

        return await this.triggerRepository.save(trigger);
    }

    @DELETE
    @Path("/:sid")
    public async deleteTrigger(@PathParam("sid") sid: number) {
        console.log("CALLED deleteTrigger");

        const user = await this.servCont.user();
        await this.wfServ.getStage(sid);

        const st = await this.stRep.findOne(sid, { relations: ["workflow", "trigger"] });
        await this.permServ.checkWFWritePermissions(user, st.workflow);
        await this.triggerRepository.remove(st.trigger);
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
            trigger.workflow = await this.wfServ.getWorkflow(trigger.workflow.id);
        }
    }

    private async validateTriggerStageIfPresent(trigger: NRTrigger) {
        if (trigger.stage) {
            trigger.stage = await this.wfServ.getStage(trigger.stage.id);
        }
    }
}
