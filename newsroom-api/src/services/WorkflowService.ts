import * as express from "express";
import { getManager } from "typeorm";
import { Context, DELETE, Errors, GET, Path, PathParam,
         POST, PreProcessor, PUT, ServiceContext } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NotFoundError, ForbiddenError } from "typescript-rest/dist/server/model/errors";

import { NRType } from "../entity/NRType";
import { NRStage, STGE_TABLE } from "../entity/NRStage";
import { NRWorkflow, WRKF_TABLE } from "../entity/NRWorkflow";
import { validators } from "./Validators";
import { common } from "./Common";

// Provides API services for workflows, and their associated stages.
@Path("/api/workflows")
@Tags("Workflows")
export class WorkflowService {
    // Context manager to grab injected user from the request.
    @Context
    private context: ServiceContext;

    // Database interactions managers.
    private stageRepository = getManager().getRepository(NRStage);
    private workflowRepository = getManager().getRepository(NRWorkflow);

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
    @PreProcessor(validators.createWorkflowValidator)
    public async createWorkflow(workflow: NRWorkflow): Promise<NRWorkflow> {
        let sessionUser = common.getUserFromContext(this.context);
        common.checkAdmin(sessionUser);

        return await this.workflowRepository.save(workflow);
    }

    /**
     * Get all existing workflows.
     * 
     * Returns:
     *      - NRWorkflow[]
     */
    @GET
    public async getWorkflows(): Promise<NRWorkflow[]> {
        return await this.workflowRepository.find();
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
        return common.getWorkflow(wid, this.workflowRepository)
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
    @PreProcessor(validators.updateWorkflowValidator)
    public async updateWorkflow(@IsInt @PathParam("wid") wid: number,
                                workflow: NRWorkflow): Promise<NRWorkflow> {
        let sessionUser = common.getUserFromContext(this.context);
        let currWorkflow = await common.getWorkflow(wid, this.workflowRepository);
        await common.checkWritePermissions(sessionUser, NRType.WRKF_KEY);

        // Update current stored name if given one.
        if (workflow.name) {
            currWorkflow.name = workflow.name;
        }

        if (workflow.description) {
            currWorkflow.description = workflow.description;
        }

        return await this.workflowRepository.save(currWorkflow);
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
    public async deleteWorkflow(@IsInt @PathParam("wid") wid: number) {
        let sessionUser = common.getUserFromContext(this.context);
        let currWorkflow = await common.getWorkflow(wid, this.workflowRepository);
        await common.checkWritePermissions(sessionUser, NRType.WRKF_KEY);

        await this.stageRepository
            .createQueryBuilder(STGE_TABLE)
            .delete()
            .from(NRStage)
            .andWhere("workflowId = :wid", { wid: currWorkflow.id })
            .execute();

        await this.workflowRepository
            .createQueryBuilder(WRKF_TABLE)
            .delete()
            .from(NRWorkflow)
            .andWhere("id = :wid", { wid: currWorkflow.id })
            .execute();
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
    @PreProcessor(validators.addStageValidator)
    public async appendStage(@IsInt @PathParam("wid") wid: number,
                             stage: NRStage, ): Promise<NRStage> {
        let sessionUser = common.getUserFromContext(this.context);
        let currWorkflow = await common.getWorkflow(wid, this.workflowRepository);
        await common.checkWritePermissions(sessionUser, NRType.WRKF_KEY);

        // Grab the next sequence ID for this set of workflow stages.
        const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

        if (maxSeqId == null) {
            stage.sequenceId = 1;
        } else {
            stage.sequenceId = maxSeqId + 1;
        }

        // Establish the relationship and save it.
        stage.workflow = currWorkflow;
        await this.workflowRepository.save(currWorkflow);
        return await this.stageRepository.save(stage);
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
        let currWorkflow = await common.getWorkflow(wid, this.workflowRepository);

        // Grab all the stages for this workflow.
        const stages = await this.stageRepository
            .createQueryBuilder(STGE_TABLE)
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .getMany();

        // Return them in ascending sequence order.
        stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
        return stages;
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
        let currWorkflow = await common.getWorkflow(wid, this.workflowRepository);

        // Grab the specified stage for the right workflow.
        const stage = await this.stageRepository
            .createQueryBuilder(STGE_TABLE)
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .andWhere("stage.id = :stageId", { stageId: sid })
            .getOne();

        return stage;
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
    @PreProcessor(validators.addStageValidator)
    public async addStageAt(stage: NRStage,
                            @IsInt @PathParam("wid") wid: number,
                            @IsInt @PathParam("pos") position: number): Promise<NRStage> {
        // Invalid position.
        if (position < 0) {
            const err_str = `Invalid position: ${position}`
            throw new Errors.BadRequestError(err_str);
        }

        let sessionUser = common.getUserFromContext(this.context);
        let currWorkflow = await common.getWorkflow(wid, this.workflowRepository);
        await common.checkWritePermissions(sessionUser, NRType.WRKF_KEY);

        // Grab the max/min sequenceId for this set of workflow stages.
        const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

        if (maxSeqId == null) { // No stages yet, just add it.
            stage.sequenceId = 0;
        } else if (position > maxSeqId + 1) {
            const err_str = `Out of bound sposition: ${position}`
            throw new Errors.BadRequestError(err_str);
        } else { // Insert normally.
            let currSeq = maxSeqId;

            // Update sequences.
            while (currSeq >= 0) {
                if (currSeq === (position - 1)) {
                    break;
                }

                await this.stageRepository
                    .createQueryBuilder(STGE_TABLE)
                    .update(NRStage)
                    .set({ sequenceId: currSeq + 1 })
                    .where("sequenceId = :sid ", { sid: currSeq })
                    .andWhere("workflowId = :wid", { wid: currWorkflow.id })
                    .execute();

                currSeq--;
            }

            stage.sequenceId = position;
        }

        // Establish the relationship and save it.
        stage.workflow = currWorkflow;
        await this.workflowRepository.save(currWorkflow);
        return await this.stageRepository.save(stage);
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
        let sessionUser = common.getUserFromContext(this.context);
        let currStage = await common.getStage(sid, this.stageRepository);
        await common.checkWritePermissions(sessionUser, NRType.WRKF_KEY);

        const maxSeqId = await this.getMaxStageSequenceId(wid);

        await this.stageRepository
            .createQueryBuilder(STGE_TABLE)
            .delete()
            .from(NRStage)
            .where("id = :stageId ", { stageId: currStage.id })
            .execute();

        let currSeq = currStage.sequenceId;

        // Nothing to update.
        if (currSeq === maxSeqId) {
            return;
        }

        // Update sequences.
        while (currSeq <= maxSeqId) {
            await this.stageRepository
                .createQueryBuilder(STGE_TABLE)
                .update(NRStage)
                .set({ sequenceId: currSeq - 1 })
                .where("sequenceId = :id ", { id: currSeq })
                .execute();

            currSeq++;
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
    @PreProcessor(validators.updateStageValidator)
    public async updateStage(@IsInt @PathParam("sid") sid: number,
                             stage: NRStage): Promise<NRStage> {
        let sessionUser = common.getUserFromContext(this.context);
        let currStage = await common.getStage(sid, this.stageRepository);
        await common.checkWritePermissions(sessionUser, NRType.WRKF_KEY);

        // Update current stored name if given one.
        if (stage.name) {
            currStage.name = stage.name;
        }

        if (stage.description) {
            currStage.description = stage.description;
        }

        return await this.stageRepository.save(currStage);
    }

    // Get the maximum sequenceId for the given workflows stages.
    private async getMaxStageSequenceId(wid: number): Promise<number> {
        let currWorkflow = await common.getWorkflow(wid, this.workflowRepository);

        // Grab the next sequenceId for this set of workflow stages.
        const maxSeq = await this.stageRepository
            .createQueryBuilder(STGE_TABLE)
            .select("MAX(stage.sequenceId)", "max")
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .getRawOne();

        return maxSeq.max;
    }
}
