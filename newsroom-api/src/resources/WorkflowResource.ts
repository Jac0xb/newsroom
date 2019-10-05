import { Inject } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context, DELETE, Errors, GET, Path, PathParam,
         POST, PreProcessor, PUT, ServiceContext } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { DBConstants, NRDocument, NRStage, NRSTPermission, NRWFPermission, NRWorkflow } from "../entity";
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

    @InjectRepository(NRDocument)
    private documentRepository: Repository<NRDocument>;

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
     * path:
     *      - None.
     * 
     * request: A workflow object to create.
     *      {
     *          "name": <string>,
     *          "description": <string>,
     *          "permission": <number>
     *      }
     *          - name: Must be unique versus other names.
     *          - permission: 1 to create with WRITE, 0 to create with READ, or not passed at all.
     *
     * response:
     *      - The created workflow object with the following relations:
     *          - None.
     *      - BadRequestError (400)
     *          - If workflow properties are missing or wrong type.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to create workflows.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @POST
    @PreProcessor(createWorkflowValidator)
    public async createWorkflow(wf: NRWorkflow): Promise<NRWorkflow> {
        try {
            const user = await this.serviceContext.user();
            wf.creator = await this.userService.getUser(user.id);
            const wfdb = await this.workflowRepository.save(wf);

            if (wf.permission !== undefined) {
                const wfup = await this.workflowService.createWFUSPermission(wfdb.id,
                                                                             user,
                                                                             wf.permission);

                // 'permission' is just for the response, so load it here.
                wfdb.permission = wfup.access;
            }

            return wfdb;
        } catch (err) {
            console.log(err);

            const errStr = `Error creating workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all existing workflows.
     * 
     * path:
     *      - None.
     * 
     * request: 
     *      - None.
     * 
     * response:
     *      - All existing workflows with the following relations:
     *          - None.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @GET
    public async getWorkflows(): Promise<NRWorkflow[]> {
        try {
            const user = await this.serviceContext.user();
            const wfs = await this.workflowRepository.find();

            // Append the 'permission' to each workflow.
            return await this.workflowService.appendPermToWFS(wfs, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error getting workflows.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get a specific workflow.
     * 
     * path:
     *      - wid: The primary key of the workflow in question.
     * 
     * request: None.
     * 
     * response: 
     *      - The requested workflow with the following relations:
     *          - Stages.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @GET
    @Path("/:wid")
    public async getWorkflow(@IsInt @PathParam("wid") wid: number): Promise<NRWorkflow> {
        const user = await this.serviceContext.user();
        let wf = await this.workflowService.getWorkflow(wid);
        wf = await this.workflowService.addStageRelationsToWF(wf);
        wf.stages = await this.workflowService.appendPermToSTS(wf.stages, user);

        return await this.workflowService.appendPermToWF(wf, user);
    }

    /**
     * Update information about a workflow.
     * 
     * path:
     *      - wid: The primary key of the workflow to update.
     * 
     * request: 
     *      {
     *          "name": <string>,
     *          "description": <string>
     *      }
     *          - name: Must be unique with regards to other existing workflows.
     *
     * response:
     *      - The updated workflow with the following relations:
     *          - None.
     *      - BadRequestError (400)
     *          - If workflow properties are missing or wrong type.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update this workflow.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @PUT
    @Path("/:wid")
    @PreProcessor(updateWorkflowValidator)
    public async updateWorkflow(@IsInt @PathParam("wid") wid: number,
                                workflow: NRWorkflow): Promise<NRWorkflow> {
        const user = await this.serviceContext.user();
        let wf = await this.workflowService.getWorkflow(wid);

        await this.permissionService.checkWFWritePermissions(user, wf);

        // Update current stored information if passed..
        if (workflow.name) {
            wf.name = workflow.name;
        }

        if (workflow.description) {
            wf.description = workflow.description;
        }

        try {
            wf = await this.workflowRepository.save(wf);
            return await this.workflowService.appendPermToWF(wf, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error updating workflow with ID=${wid}`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete a workflow and all associated stages.
     * 
     * path:
     *      - wid: The primary key of the workflow to delete.
     * 
     * request: None.
     *
     * returns:
     *      - Nothing.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to delete this workflow.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @DELETE
    @Path("/:wid")
    public async deleteWorkflow(@IsInt @PathParam("wid") wid: number): Promise<string> {
        const user = this.serviceContext.user();
        const wf = await this.workflowService.getWorkflow(wid);

        await this.permissionService.checkWFWritePermissions(user, wf);

        try {
            // Remove stages, but leave documents with relationships as NULL.
            await this.workflowRepository.remove(wf);

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
     * path: 
     *      - wid: The primary key of the workflow in question.
     * 
     * request:
     *      {
     *          "name": <string>,
     *          "description": <string>
     *      }
     * 
     * response:
     *      - NRStage that was created.
     *      - BadRequestError (400)
     *          - If workflow properties are missing.
     *          - If workflow properties are wrong type.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @POST
    @Path("/:wid/stages")
    @PreProcessor(addStageValidator)
    public async appendStage(@IsInt @PathParam("wid") wid: number,
                             stage: NRStage): Promise<NRStage> {
        const user = await this.serviceContext.user();
        const wf = await this.workflowService.getWorkflow(wid);

        await this.permissionService.checkWFWritePermissions(user, wf);

        const maxSeqId = await this.getMaxStageSequenceId(wf.id);

        if (maxSeqId == null) {
            stage.sequenceId = 1;
        } else {
            stage.sequenceId = maxSeqId + 1;
        }

        try {
            stage.workflow = wf;
            stage.creator = user;
            await this.workflowRepository.save(wf);
            const st = await this.stageRepository.save(stage);

            if (stage.permission !== undefined) {
                const stup = await this.workflowService.createSTUSPermission(st.id,
                                                                             user,
                                                                             stage.permission);

                // 'permission' is just for the response, so load it here.
                st.permission = stup.access;
            }

            return st;
        } catch (err) {
            console.log(err);

            const errStr = `Error appending stage to workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all stages for a specific workflow.
     *
     * path:
     *      - wid: The primary key of the workflow in question.
     * 
     * request: None.
     * 
     * response:
     *      - NRStage[]
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @GET
    @Path("/:wid/stages")
    public async getStages(@IsInt @PathParam("wid") wid: number): Promise<NRStage[]> {
        const wf = await this.workflowService.getWorkflow(wid);

        try {
            const stages = await this.stageRepository.find({ where: { workflow: wf }});
            // const stages = await this.stageRepository
            //     .createQueryBuilder(DBConstants.STGE_TABLE)
            //     .where("stage.workflowId = :id", {id: currWorkflow.id})
            //     .getMany();

            // Return them in ascending sequence order.
            stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
            return stages;
            // return await this.workflowService.getPermissionsForSTGS(stages, sessionUser);
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

            return stage;
            // return await this.workflowService.getPermissionsForST(stage, sessionUser);
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
            position = 0;
        }

        const sessionUser = this.serviceContext.user();
        const currWorkflow = await this.workflowService.getWorkflow(wid);
        await this.permissionService.checkWFWritePermissions(sessionUser, currWorkflow);

        stage.creator = sessionUser;

        try {
            // Grab the max/min sequenceId for this set of workflow stages.
            const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

            if (maxSeqId == null) { // No stages yet, just add it.
                stage.sequenceId = 0;
            } else if (position > maxSeqId + 1) {
                position = maxSeqId + 1;
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
            return stage;
            // return await this.workflowService.getPermissionsForST(stage, sessionUser);
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
                             @PathParam("sid") sid: number): Promise<any> {
        const sessionUser = this.serviceContext.user();
        const currStage = await this.workflowService.getStage(sid);
        const wf = await this.workflowService.getWorkflow(wid);
        await this.permissionService.checkWFWritePermissions(sessionUser, wf);

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
                // TODO: Has to be a better way to make this return a 200 OK,
                //       or just return 204?
                return "";
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

            // TODO: Has to be a better way to make this return a 200 OK,
            //       or just return 204?
            return "";

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
        // const wf = await this.workflowService.getWorkflow(wid);

        // await this.permissionService.checkWFWritePermissions(sessionUser, currStage.workflow.id);

        try {
            // Update current stored userName if given one.
            if (stage.name) {
                currStage.name = stage.name;
            }

            if (stage.description) {
                currStage.description = stage.description;
            }

            currStage = await this.stageRepository.save(currStage);
            return currStage;
            // return await this.workflowService.getPermissionsForST(currStage, sessionUser);
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
