import * as express from "express";
import { NRStage, NRWorkflow } from "orm";
import { getManager } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { Tags } from "typescript-rest-swagger";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

/**
 * Provides API services for Workflows, and the stages associated with a workflow.
 */
@Path("/workflows")
@Tags("Workflows")
export class WorkflowService {

    /**
     * When creating a new workflow, we need to validate that it has all the
     * required information to define a workflow. The workflow id should always
     * be blank because it is an auto-generated column.
     */
    private static createWorkflowValidator(req: express.Request): void {
        const workflow = req.body as NRWorkflow;

        if (!workflow.name) {
            throw new Errors.BadRequestError("Workflow name not present.");
        }

        if (!(typeof workflow.name === "string")) {
            throw new Errors.BadRequestError("Workflow name was not a string.");
        }

        if (!workflow.creator) {
            throw new Errors.BadRequestError("Workflow creator not present.");
        }

        if (!(typeof workflow.creator === "string")) {
            throw new Errors.BadRequestError("Workflow creator was not a string.");
        }
    }

    /**
     * When updating a workflow, fields may be empty because only some need to be
     * updated.
     */
    private static updateWorkflowValidator(req: express.Request): void {
        const workflow = req.body as NRWorkflow;

        if (workflow.name) {
            if (!(typeof workflow.name === "string")) {
                throw new Errors.BadRequestError("Workflow name was not a string.");
            }
        }

        if (workflow.creator) {
            if (!(typeof workflow.creator === "string")) {
                throw new Errors.BadRequestError("Workflow creator was not a string.");
            }
        }
    }

    /**
     * When adding a stage to a workflow, we need to validate that we have
     * the necessary information within the database to create it.
     */
    private static addStageValidator(req: express.Request): void {
        const stage = req.body as NRStage;

        if (!stage.name) {
            throw new Errors.BadRequestError("Stage name not present.");
        }

        if (!(typeof stage.name === "string")) {
            throw new Errors.BadRequestError("Stage name was not a string.");
        }

        if (!stage.creator) {
            throw new Errors.BadRequestError("Stage creator not present.");
        }

        if (!(typeof stage.creator === "string")) {
            throw new Errors.BadRequestError("Stage creator was not a string.");
        }

        if (!stage.workflow) {
            throw new Errors.BadRequestError("Stage workflow id not present.");
        }

        if (!(typeof stage.workflow === "number")) {
            throw new Errors.BadRequestError("Stage workflow id was not a number.");
        }
    }

    /**
     * When updating a stage, we need to validate that we at least have an id
     * to identify it. Other fields may be empty because only some need to be
     * updated.
     */
    private static updateStageValidator(req: express.Request): void {
        const stage = req.body as NRStage;

        if (stage.name) {
            if (!(typeof stage.name === "string")) {
                throw new Errors.BadRequestError("Stage name was not a string.");
            }
        }

        if (stage.creator) {
            if (!(typeof stage.creator === "string")) {
                throw new Errors.BadRequestError("Stage creator was not a string.");
            }
        }
    }

    /**
     * Used to interact with any given workflow/stage in the database.
     */
    public workflowRepository = getManager().getRepository(NRWorkflow);
    public stageRepository = getManager().getRepository(NRStage);

    /**
     * Create a new entry in the 'workflow' table with the specified
     * information.
     *
     * Returns a 400 if:
     *      - Workflow properties are missing.
     *      - Workflow properties are wrong type.
     */
    @POST
    @PreProcessor(WorkflowService.createWorkflowValidator)
    public async createWorkflow(workflow: NRWorkflow): Promise<NRWorkflow> {
        // TODO: Catch more exceptions here.
        return await this.workflowRepository.save(workflow);
    }

    /**
     * Get all workflows that exist in the 'workflow' table under the
     * configured connection.
     */
    @GET
    public getWorkflows(): Promise<NRWorkflow[]> {
        return this.workflowRepository.find();
    }

    /**
     * Get a specific workflow from 'workflow' table based on passed
     * workflow id.
     *
     * Returns a 404 if:
     *      - Workflow not found.
     */
    @GET
    @Path("/:id")
    public async getWorkflow(@PathParam("id") id: number): Promise<NRWorkflow> {
        try {
            return await this.workflowRepository.findOneOrFail(id);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }
    }

    /**
     * Update an entry in the 'workflow' table with the specified
     * information.
     *
     * Returna 400 if:
     *      - Workflow property types incorrect.
     *
     * Returns 404 if:
     *      - Workflow id field is missing or not found.
     */
    @PUT
    @Path("/:id")
    @PreProcessor(WorkflowService.updateWorkflowValidator)
    public async updateWorkflow(@PathParam("id") wid: number,
        workflow: NRWorkflow): Promise<NRWorkflow> {

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Update current stored name if given one.
        if (workflow.name) {
            currWorkflow.name = workflow.name;
        }

        // Update creator name if given one.
        if (workflow.creator) {
            currWorkflow.creator = workflow.creator;
        }

        // TODO: Catch more exceptions here.
        return await this.workflowRepository.save(currWorkflow);
    }

    /**
     * Delete a workflow and all associated stages.
     *
     * Returns 404 if:
     *      - Workflow id not found.
     */
    @DELETE
    @Path("/:id")
    public async deleteWorkflow(@PathParam("id") wid: number): Promise<any> {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        await this.stageRepository
            .createQueryBuilder("stage")
            .delete()
            .from(NRStage)
            .andWhere("workflowId = :wid", { wid: currWorkflow.id })
            .execute();

        await this.workflowRepository
            .createQueryBuilder("workflow")
            .delete()
            .from(NRWorkflow)
            .andWhere("id = :wid", { wid: currWorkflow.id })
            .execute();
    }

    /**
     * Add a stage at the end of the workflow.
     *
     * Returns 400 if:
     *      - Stage properties missing.
     *      - Stage property types incorrect.
     *
     * Returns 404 if:
     *      - Workflow id not found.
     */
    @POST
    @Path("/:id/stages")
    @PreProcessor(WorkflowService.addStageValidator)
    public async appendStage(stage: NRStage,
        @PathParam("id") workflowId: number): Promise<any> {

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Grab the next sequenceId for this set of workflow stages.
        const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

        if (maxSeqId == null) {
            stage.sequenceId = 1;
        } else {
            stage.sequenceId = maxSeqId + 1;
        }

        // Establish the relationship.
        stage.workflow = currWorkflow;

        // Save the workflow so that the relationship gets saved
        // correctly. Then save and return the stage that got
        // created.
        await this.workflowRepository.save(currWorkflow);
        return await this.stageRepository.save(stage);
    }

    /**
     * Get all stages that exist in the 'stage' table under the
     * configured connection for the specified workflow.
     *
     * Returns 404 if:
     *      - Workflow id not found.
     */
    @GET
    @Path("/:id/stages")
    public async getStages(@PathParam("id") workflowId: number): Promise<any> {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Grab all the stages for this workflow.
        const stages = await this.stageRepository
            .createQueryBuilder("stage")
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .getMany();

        return stages;
    }

    /**
     * Get a stage based on its ID and workflow.
     *
     * Returns 404 if:
     *      - Stage id not found.
     */
    @GET
    @Path("/:id/stages/:sid")
    public async getStage(@PathParam("id") wid: number,
        @PathParam("sid") sid: number): Promise<any> {

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Grab all the stages for this workflow.
        const stage = await this.stageRepository
            .createQueryBuilder("stage")
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .andWhere("stage.id = :stageId", { stageId: sid })
            .getOne();

        return stage;
    }

    /**
     * Add a stage at the given position in the workflow.
     *
     * Position is NOT zero indexed.
     *
     * Returns 400 if:
     *      - Stage properties missing.
     *      - Stage property types incorrect.
     *      - Stage position is not > 0.
     *
     * Returns 404 if:
     *      - Workflow id not found.
     */
    @POST
    @Path("/:id/stages/:pos")
    @PreProcessor(WorkflowService.addStageValidator)
    public async addStageAt(stage: NRStage,
        @PathParam("id") workflowId: number,
        @PathParam("pos") position: number): Promise<any> {

        // Invalid position.
        if (position <= 0) {
            throw new Errors.BadRequestError("Stage position cannot be negative.");
        }

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Grab the max/min sequenceId for this set of workflow stages.
        const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

        if (maxSeqId == null) { // No stages yet, just add it.
            stage.sequenceId = 1;
        } else if (position > maxSeqId + 1) {
            throw new Errors.BadRequestError("Stage position past bounds.");
        } else { // Insert normally.
            let currSeq = maxSeqId;

            // Update sequences.
            while (currSeq >= 1) {
                if (currSeq === (position - 1)) {
                    break;
                }

                await this.stageRepository
                    .createQueryBuilder("stage")
                    .update(NRStage)
                    .set({ sequenceId: currSeq + 1 })
                    .where("sequenceId = :sid ", { sid: currSeq })
                    .andWhere("workflowId = :wid", { wid: currWorkflow.id })
                    .execute();

                currSeq--;
            }

            stage.sequenceId = position;
        }

        // Establish the relationship.
        stage.workflow = currWorkflow;

        // Save the workflow so that the relationship gets saved
        // correctly. Then save and return the stage that got
        // created.
        await this.workflowRepository.save(currWorkflow);
        return await this.stageRepository.save(stage);
    }

    /**
     * Delete a stage at the given position in the workflow.
     *
     * Position is NOT zero indexed.
     *
     * Returns 400 if:
     *      - Stage properties missing.
     *      - Stage property types incorrect.
     *
     * Returns 404 if:
     *      - Workflow id not found.
     */
    @DELETE
    @Path("/:id/stages/:pos")
    public async deleteStageAt(stage: NRStage,
        @PathParam("id") workflowId: number,
        @PathParam("pos") position: number): Promise<any> {

        // Invalid position.
        if (position <= 0) {
            throw new Errors.BadRequestError("Stage position cannot be negative.");
        }

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Grab the max/min sequenceId for this set of workflow stages.
        const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

        if (maxSeqId == null) { // Nothing to remove.
            return;
        } else if (position > maxSeqId) {
            throw new Errors.BadRequestError("Stage position past bounds.");
        } else { // Delete normally.
            await this.stageRepository
                .createQueryBuilder("stage")
                .delete()
                .from(NRStage)
                .where("sequenceId = :sid ", { sid: position })
                .andWhere("workflowId = :wid", { wid: currWorkflow.id })
                .execute();

            let currSeq = position + 1;

            // Update sequences.
            while (currSeq <= maxSeqId) {
                await this.stageRepository
                    .createQueryBuilder("stage")
                    .update(NRStage)
                    .set({ sequenceId: currSeq - 1 })
                    .where("sequenceId = :id ", { id: currSeq })
                    .execute();

                currSeq++;
            }
        }
    }

    /**
     * Update an entry in the 'stage' table with the specified
     * information.
     *
     * Returna 400 if:
     *      - Stage property types incorrect.
     *
     * Returns 404 if:
     *      - Stage id field is missing or not found.
     */
    @PUT
    @Path("/:id/stages/:sid")
    @PreProcessor(WorkflowService.updateStageValidator)
    public async updateStage(@PathParam("sid") sid: number,
        stage: NRStage): Promise<NRStage> {

        let currStage: NRStage;

        try {
            currStage = await this.stageRepository.findOneOrFail(sid);
        } catch (err) {
            console.error("Error getting stage:", err);
            throw new NotFoundError("A stage with the given id was not found.");
        }

        // Update current stored name if given one.
        if (stage.name) {
            currStage.name = stage.name;
        }

        // Update creator name if given one.
        if (stage.creator) {
            currStage.creator = stage.creator;
        }

        // TODO: Catch more exceptions here.
        return await this.stageRepository.save(currStage);
    }

    /**
     * Get the maximum sequenceId for the given workflows stages.
     */
    private async getMaxStageSequenceId(workflowId: number): Promise<number> {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Grab the next sequenceId for this set of workflow stages.
        const maxSeq = await this.stageRepository
            .createQueryBuilder("stage")
            .select("MAX(stage.sequenceId)", "max")
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .getRawOne();

        return maxSeq.max;
    }

    /**
     * Get the minimum sequenceId for the given workflows stages.
     */
    private async getMinStageSequenceId(workflowId: number): Promise<number> {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Grab the next sequenceId for this set of workflow stages.
        const minSeq = await this.stageRepository
            .createQueryBuilder("stage")
            .select("MIN(stage.sequenceId)", "min")
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .getRawOne();

        return minSeq.min;
    }
}
