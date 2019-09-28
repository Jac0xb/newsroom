import { Inject } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import {
    Context,
    DELETE,
    Errors,
    GET,
    Path,
    PathParam,
    POST,
    PreProcessor,
    PUT,
    ServiceContext,
} from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { DBConstants, NRStage, NRSTPermission, NRWFPermission, NRWorkflow } from "../entity";
import { RoleResource } from "../resources/RoleResource";
import { PermissionService } from "../services/PermissionService";
import { UserService } from "../services/UserService";
import { WorkflowService } from "../services/WorkflowService";
import { addStageValidator, updateStageValidator } from "../validators/StageValidators";
import { createWorkflowValidator, updateWorkflowValidator } from "../validators/WorkflowValidators";

// Provides API services for workflows, and their associated stages.
@Path("/api/workflows")
@Tags("Workflows")
export class WorkflowResource {
    @Context
    private serviceContext: ServiceContext;

    @InjectRepository(NRStage)
    private stageRepository: Repository<NRStage>;

    @InjectRepository(NRWorkflow)
    private workflowRepository: Repository<NRWorkflow>;

    @InjectRepository(NRWFPermission)
    private permWFRepository: Repository<NRWFPermission>;

    @InjectRepository(NRSTPermission)
    private permSTRepository: Repository<NRSTPermission>;

    @Inject()
    private userService: UserService;

    @Inject()
    private workflowService: WorkflowService;

    @Inject()
    private permissionService: PermissionService;

    @Inject()
    private roleResource: RoleResource;

    /**
     * Create a new workflow based on the passed information.
     *
     * Returns:
     *      - NRWorkflow
     *      - BadRequestError (400)
     *          - If workflow properties are missing.
     *          - If workflow properties are wrong type.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to create workflows.
     */
    @POST
    @PreProcessor(createWorkflowValidator)
    public async createWorkflow(workflow: NRWorkflow): Promise<NRWorkflow> {
        const sessionUser = this.serviceContext.user();

        // The creator is whoever is logged in.
        workflow.creator = await this.userService.getUser(sessionUser.id);

        try {
            // Append the permissions to the response.
            return await this.workflowService.getPermissionsForWF(await this.workflowRepository.save(workflow),
                                                                  this.serviceContext.user());
        } catch (err) {
            console.log(err);

            const errStr = `Error creating workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all existing workflows.
     *
     * Returns:
     *      - NRWorkflow[]
     */
    @GET
    public async getWorkflows(): Promise<NRWorkflow[]> {
        try {
            // Append permissions to response.
            return await this.workflowService.getPermissionsForWFS(await this.workflowRepository.find(),
            this.serviceContext.user());
        } catch (err) {
            console.log(err);

            const errStr = `Error getting workflows.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get a specific workflow by ID.
     *
     * Returns:
     *      - NRWorkflow
     *      - NotFoundError (404)
     *          - If workflow not found.
     */
    @GET
    @Path("/:wid")
    public async getWorkflow(@IsInt @PathParam("wid") wid: number): Promise<NRWorkflow> {
        const wf = await this.workflowService.getWorkflow(wid);
        return await this.workflowService.getPermissionsForWF(wf, this.serviceContext.user());
    }

    /**
     * Update information about a workflow.
     *
     * Returns:
     *      - NRWorkflow
     *      - BadRequestError (400)
     *          - If workflow properties are missing.
     *          - If workflow properties are wrong type.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     */
    @PUT
    @Path("/:wid")
    @PreProcessor(updateWorkflowValidator)
    public async updateWorkflow(@IsInt @PathParam("wid") wid: number,
                                workflow: NRWorkflow): Promise<NRWorkflow> {
        const sessionUser = this.serviceContext.user();
        const currWorkflow = await this.workflowService.getWorkflow(wid);
        await this.permissionService.checkWFWritePermissions(sessionUser, wid);

        // Update current stored userName if given one.
        if (workflow.name) {
            currWorkflow.name = workflow.name;
        }

        if (workflow.description) {
            currWorkflow.description = workflow.description;
        }

        try {
            return await this.workflowService.getPermissionsForWF(await this.workflowRepository.save(currWorkflow), 
                                                                  this.serviceContext.user());
        } catch (err) {
            console.log(err);

            const errStr = `Error updating workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete a workflow and all associated stages.
     *
     * Returns:
     *      - ForbiddenError (403)
     *          - If request user is not allowed to delete workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     */
    @DELETE
    @Path("/:wid")
    public async deleteWorkflow(@IsInt @PathParam("wid") wid: number): Promise<string> {
        const sessionUser = this.serviceContext.user();
        const currWorkflow = await this.workflowService.getWorkflow(wid);
        await this.permissionService.checkWFWritePermissions(sessionUser, wid);

        try {
            await this.workflowRepository.remove(currWorkflow);

            // TODO: There has to be a better way to make this return a 200 OK.
            return "";
        } catch (err) {
            console.log(err);

            const errStr = `Error updating workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Add a stage at the end of the workflow.
     *
     * Returns:
     *      - NRStage
     *      - BadRequestError (400)
     *          - If workflow properties are missing.
     *          - If workflow properties are wrong type.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     */
    @POST
    @Path("/:wid/stages")
    @PreProcessor(addStageValidator)
    public async appendStage(@IsInt @PathParam("wid") wid: number,
                             stage: NRStage): Promise<NRStage> {
        const sessionUser = this.serviceContext.user();
        const currWorkflow = await this.workflowService.getWorkflow(wid);
        await this.permissionService.checkWFWritePermissions(sessionUser, wid);

        // Grab the next sequence ID for this set of workflow stages.
        const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

        if (maxSeqId == null) {
            stage.sequenceId = 1;
        } else {
            stage.sequenceId = maxSeqId + 1;
        }

        try {
            // Establish the relationship and save it.
            stage.workflow = currWorkflow;
            stage.creator = sessionUser;
            await this.workflowRepository.save(currWorkflow);
            const st = await this.stageRepository.save(stage);
            return await this.workflowService.getPermissionsForST(st, sessionUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error appending stage to workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all stages for a specific workflow.
     *
     * Returns:
     *      - NRStage[]
     *      - NotFoundError (404)
     *          - If workflow not found.
     */
    @GET
    @Path("/:wid/stages")
    public async getStages(@IsInt @PathParam("wid") wid: number): Promise<NRStage[]> {
        const sessionUser = this.serviceContext.user();
        const currWorkflow = await this.workflowService.getWorkflow(wid);

        try {
            // Grab all the stages for this workflow.
            const stages = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .where("stage.workflowId = :id", {id: currWorkflow.id})
                .getMany();

            // Return them in ascending sequence order.
            stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
            return await this.workflowService.getPermissionsForSTGS(stages, sessionUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error getting stages for workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get a specific stage by ID.
     *
     * Returns:
     *      - NRStage
     *      - NotFoundError (404)
     *          - If workflow not found.
     */

    @GET
    @Path("/:wid/stages/:sid")
    public async getStage(@IsInt @PathParam("wid") wid: number,
                          @IsInt @PathParam("sid") sid: number): Promise<NRStage> {
        const sessionUser = this.serviceContext.user();
        const currWorkflow = await this.workflowService.getWorkflow(wid);

        try {
            // Grab the specified stage for the right workflow.
            const stage = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .where("stage.workflowId = :id", {id: currWorkflow.id})
                .andWhere("stage.id = :stageId", {stageId: sid})
                .getOne();

            return await this.workflowService.getPermissionsForST(stage, sessionUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error getting stage for workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Add a stage at the given position in the workflow.
     *
     * Returns:
     *      - NRStage
     *      - BadRequestError (400)
     *          - If the position is out of bounds or negative.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     */
    @POST
    @Path("/:wid/stages/:pos")
    @PreProcessor(addStageValidator)
    public async addStageAt(stage: NRStage,
                            @IsInt @PathParam("wid") wid: number,
                            @IsInt @PathParam("pos") position: number): Promise<NRStage> {
        // Invalid position.
        if (position < 0) {
            const errStr = `Invalid position: ${position}`;
            throw new Errors.BadRequestError(errStr);
        }

        const sessionUser = this.serviceContext.user();
        const currWorkflow = await this.workflowService.getWorkflow(wid);
        await this.permissionService.checkWFWritePermissions(sessionUser, wid);

        stage.creator = sessionUser;

        try {
            // Grab the max/min sequenceId for this set of workflow stages.
            const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

            if (maxSeqId == null) { // No stages yet, just add it.
                stage.sequenceId = 0;
            } else if (position > maxSeqId + 1) {
                const errStr = `Out of bounds position: ${position}`;
                throw new Errors.BadRequestError(errStr);
            } else { // Insert normally.
                let currSeq = maxSeqId;

                // Update sequences.
                while (currSeq >= 0) {
                    if (currSeq === (position - 1)) {
                        break;
                    }

                    await this.stageRepository
                        .createQueryBuilder(DBConstants.STGE_TABLE)
                        .update(NRStage)
                        .set({sequenceId: currSeq + 1})
                        .where("sequenceId = :sid ", {sid: currSeq})
                        .andWhere("workflowId = :wid", {wid: currWorkflow.id})
                        .execute();

                    currSeq--;
                }

                stage.sequenceId = position;
            }

            // Establish the relationship and save it.
            stage.workflow = currWorkflow;
            await this.workflowRepository.save(currWorkflow);
            stage = await this.stageRepository.save(stage);
            return await this.workflowService.getPermissionsForST(stage, sessionUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error adding stage to workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete the given stage.
     *
     * Returns:
     *      - BadRequestError (400)
     *          - If the position is out of bounds or negative.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *          - If stage not found.
     */
    @DELETE
    @Path("/:wid/stages/:sid")
    public async deleteStage(@IsInt @PathParam("wid") wid: number,
                             @PathParam("sid") sid: number) {
        const sessionUser = this.serviceContext.user();
        const currStage = await this.workflowService.getStage(sid);
        await this.permissionService.checkWFWritePermissions(sessionUser, wid);

        try {
            const maxSeqId = await this.getMaxStageSequenceId(wid);

            await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .delete()
                .from(NRStage)
                .where("id = :stageId ", {stageId: currStage.id})
                .execute();

            let currSeq = currStage.sequenceId;

            // Nothing to update.
            if (currSeq === maxSeqId) {
                return;
            }

            // Update sequences.
            while (currSeq <= maxSeqId) {
                await this.stageRepository
                    .createQueryBuilder(DBConstants.STGE_TABLE)
                    .update(NRStage)
                    .set({sequenceId: currSeq - 1})
                    .where("sequenceId = :id ", {id: currSeq})
                    .execute();

                currSeq++;
            }

        } catch (err) {
            console.log(err);

            const errStr = `Error deleting stage in workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Update the given stage.
     *
     * Returns:
     *      - NRStage
     *      - BadRequestError (400)
     *          - If the position is out of bounds or negative.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *          - If stage not found.
     */
    @PUT
    @Path("/:id/stages/:sid")
    @PreProcessor(updateStageValidator)
    public async updateStage(@IsInt @PathParam("sid") sid: number,
                             stage: NRStage): Promise<NRStage> {
        const sessionUser = this.serviceContext.user();
        let currStage = await this.workflowService.getStage(sid);

        await this.permissionService.checkWFWritePermissions(sessionUser, currStage.workflow.id);

        try {
            // Update current stored userName if given one.
            if (stage.name) {
                currStage.name = stage.name;
            }

            if (stage.description) {
                currStage.description = stage.description;
            }

            currStage = await this.stageRepository.save(currStage);
            return await this.workflowService.getPermissionsForST(currStage, sessionUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error updating stage.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    // Get the maximum sequenceId for the given workflows stages.
    private async getMaxStageSequenceId(wid: number): Promise<number> {
        const currWorkflow = await this.workflowService.getWorkflow(wid);

        // Grab the next sequenceId for this set of workflow stages.
        const maxSeq = await this.stageRepository
            .createQueryBuilder(DBConstants.STGE_TABLE)
            .select("MAX(stage.sequenceId)", "max")
            .where("stage.workflowId = :id", {id: currWorkflow.id})
            .getRawOne();

        return maxSeq.max;
    }
}
