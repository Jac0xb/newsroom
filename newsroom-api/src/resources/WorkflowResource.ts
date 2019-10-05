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
            } else {
                wf.permission = DBConstants.READ;
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
     *          "description": <string>,
     *          "permission": <number>
     *      }
     *          - permission: 1 to create with WRITE, 0 to create with READ, or not passed at all.
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

        const maxSeqId = await this.workflowService.getMaxStageSequenceId(wf);

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
            } else {
                st.permission = DBConstants.READ;
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
        const user = this.serviceContext.user();
        const wf = await this.workflowService.getWorkflow(wid);

        try {
            const stages = await this.stageRepository.find({ where: { workflow: wf }});

            // Return them in ascending sequence order.
            stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
            return await this.workflowService.appendPermToSTS(stages, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error getting stages for workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get a specific stage by ID.
     * 
     * path:
     *      - wid: The primary key of the workflow in question.
     *      - sid: The primary key of the stage in question.
     * 
     * request: None.
     * 
     * response:
     *      - NRStage
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @GET
    @Path("/:wid/stages/:sid")
    public async getStage(@IsInt @PathParam("wid") wid: number,
                          @IsInt @PathParam("sid") sid: number): Promise<NRStage> {
        const user = this.serviceContext.user();
        const wf = await this.workflowService.getWorkflow(wid);

        try {
            // Grab the specified stage for the right workflow.
            const stage = await this.stageRepository.findOne({ where: { "workflowId": wid, "id": sid}});

            return await this.workflowService.appendPermToST(stage, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error getting stage for workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Add a stage at the given position in the workflow.
     * 
     * path: 
     *      - wid: The primary key of the workflow in question.
     *      - position: The position to add the stage at, NOT zero-indexed.
     * 
     * request:
     *      {
     *          "name": <string>,
     *          "description": <string>,
     *          "permission": <number>
     *      }
     *          - permission: 1 to create with WRITE, 0 to create with READ, or not passed at all.
     *
     * response:
     *      - NRStage
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @POST
    @Path("/:wid/stages/:pos")
    @PreProcessor(addStageValidator)
    public async addStageAt(stage: NRStage,
                            @IsInt @PathParam("wid") wid: number,
                            @IsInt @PathParam("pos") position: number): Promise<NRStage> {
        // Invalid position.
        if (position <= 0) {
            position = 1;
        }

        const user = this.serviceContext.user();
        const wf = await this.workflowService.getWorkflow(wid);

        await this.permissionService.checkWFWritePermissions(user, wf);
        stage.creator = user;

        try {
            // Grab the max/min sequenceId for this set of workflow stages.
            const maxSeqId = await this.workflowService.getMaxStageSequenceId(wf);

            // Add if no stages yet.
            if (maxSeqId == null) {
                stage.sequenceId = 1;
            } else if (position > maxSeqId + 1) {
                position = maxSeqId + 1;
            } else { 
                // Insert normally.
                let currSeq = maxSeqId;

                // Update sequences.
                while (currSeq > 0) {
                    if (currSeq === (position - 1)) {
                        break;
                    }

                    await this.stageRepository
                        .createQueryBuilder(DBConstants.STGE_TABLE)
                        .update(NRStage)
                        .set({sequenceId: currSeq + 1})
                        .where("sequenceId = :sid ", {sid: currSeq})
                        .andWhere("workflowId = :wid", {wid: wf.id})
                        .execute();

                    currSeq--;
                }

                stage.sequenceId = position;
            }

            // Establish the relationship and save it.
            stage.workflow = wf;
            await this.workflowRepository.save(wf);
            stage = await this.stageRepository.save(stage);

            if (stage.permission !== undefined) {
                const stup = await this.workflowService.createSTUSPermission(stage.id,
                                                                             user,
                                                                             stage.permission);

                // 'permission' is just for the response, so load it here.
                stage.permission = stup.access;
            } else {
                stage.permission = DBConstants.READ;
            }

            return stage;
        } catch (err) {
            console.log(err);

            const errStr = `Error adding stage to workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete the given stage.
     * 
     * path:
     *      - wid: The primary key of the workflow in question.
     *      - sid: The primary key of the stage in question.
     * 
     * request: None.
     *
     * response:
     *      - BadRequestError (400)
     *          - If the position is out of bounds or negative.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *          - If stage not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @DELETE
    @Path("/:wid/stages/:sid")
    public async deleteStage(@IsInt @PathParam("wid") wid: number,
                             @PathParam("sid") sid: number): Promise<any> {
        const user = this.serviceContext.user();
        const st = await this.workflowService.getStage(sid);
        const wf = await this.workflowService.getWorkflow(wid);

        await this.permissionService.checkWFWritePermissions(user, wf);

        try {
            const maxSeqId = await this.workflowService.getMaxStageSequenceId(wf);

            await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .delete()
                .from(NRStage)
                .where("id = :stageId", {stageId: st.id})
                .execute();

            let currSeq = st.sequenceId;

            // Nothing to update.
            if (currSeq === maxSeqId) {
                // TODO: Has to be a better way to make this return a 200 OK.
                return "";
            }

            // Update sequences.
            while (currSeq <= maxSeqId) {
                currSeq++;

                await this.stageRepository
                    .createQueryBuilder(DBConstants.STGE_TABLE)
                    .update(NRStage)
                    .set({sequenceId: currSeq - 1})
                    .where("sequenceId = :id ", {id: currSeq})
                    .andWhere("workflowId = :wfid", {wfid: wf.id})
                    .execute();
            }

            // TODO: Has to be a better way to make this return a 200 OK.
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
     * path: 
     *      - wid: The primary key of the workflow in question.
     *      - sid: The primary key of the stage in question.
     * 
     * request:
     *      {
     *          "name": <string>,
     *          "permission": <string>
     *      }
     *
     * response:
     *      - The updated NRStage.
     *      - BadRequestError (400)
     *          - If the position is out of bounds or negative.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *          - If stage not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong
     */
    @PUT
    @Path("/:wid/stages/:sid")
    @PreProcessor(updateStageValidator)
    public async updateStage(@IsInt @PathParam("wid") wid: number,
                             @IsInt @PathParam("sid") sid: number,
                             stage: NRStage): Promise<NRStage> {
        const user = this.serviceContext.user();
        const wf = await this.workflowService.getWorkflow(wid);
        let st = await this.workflowService.getStage(sid);

        await this.permissionService.checkWFWritePermissions(user, wf);

        try {
            if (stage.name) {
                st.name = stage.name;
            }

            if (stage.description) {
                st.description = stage.description;
            }

            st = await this.stageRepository.save(st);
            return await this.workflowService.appendPermToST(st, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error updating stage.`;
            throw new Errors.InternalServerError(errStr);
        }
    }
}
