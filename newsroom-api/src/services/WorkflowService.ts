import * as express from "express";
import { NRStage, NRWorkflow } from "orm";
import { getManager } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

/**
 * Provides API services for Workflows, and the stages associated with workflows.
 */
@Path("/api/workflows")
@Tags("Workflows")
export class WorkflowService {

    /**
     * When creating a new workflow, we need to validate that it has all the
     * required information to define a workflow. The workflow id should always
     * be blank because it is an auto-generated column.
     */
    private static createWorkflowValidator(req: express.Request) {
        const workflow = req.body as NRWorkflow;

        if (!workflow.name) {
            throw new Errors.BadRequestError("Workflow name not present.");
        }

        if (!(typeof workflow.name === "string")) {
            throw new Errors.BadRequestError("Workflow name was not a string.");
        }

        if (workflow.name.length > 256) {
            throw new Errors.BadRequestError("Workflow name too long, max 256.");
        }

        if (!workflow.creator) {
            throw new Errors.BadRequestError("Workflow creator not present.");
        }

        if (!(typeof workflow.creator === "string")) {
            throw new Errors.BadRequestError("Workflow creator was not a string.");
        }

        if (workflow.creator.length > 256) {
            throw new Errors.BadRequestError("Workflow creator too long, max 256.");
        }

        if (workflow.description) {
            if (!(typeof workflow.description === "string")) {
                throw new Errors.BadRequestError("Workflow description was not a string.");
            }

            if (workflow.description.length > 1000) {
                throw new Errors.BadRequestError("Workflow description too long, max 1000");
            }
        }
    }

    /**
     * When updating a workflow, fields may be empty because only some need to be
     * updated.
     */
    private static updateWorkflowValidator(req: express.Request) {
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

        if (workflow.description) {
            if (!(typeof workflow.description === "string")) {
                throw new Errors.BadRequestError("Workflow description was not a string.");
            }

            if (workflow.description.length > 1000) {
                throw new Errors.BadRequestError("Workflow description too long, max 1000.");
           }
        }
    }

    /**
     * When adding a stage to a workflow, we need to validate that we have
     * the necessary information within the database to create it.
     */
    private static addStageValidator(req: express.Request) {
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

        if (stage.description) {
            if (!(typeof stage.description === "string")) {
                throw new Errors.BadRequestError("Stage description was not a string.");
            }

            if (stage.description.length > 1000) {
                throw new Errors.BadRequestError("Stage description too long, max 1000.");
           }
        }
    }

    /**
     * When updating a stage, we need to validate that we at least have an id
     * to identify it. Other fields may be empty because only some need to be
     * updated.
     */
    private static updateStageValidator(req: express.Request) {
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

        if (stage.description) {
            if (!(typeof stage.description === "string")) {
                throw new Errors.BadRequestError("Stage description was not a string.");
            }

            if (stage.description.length > 1000) {
                throw new Errors.BadRequestError("Stage description too long, max 1000.");
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
    public async getWorkflow(@IsInt @PathParam("id") workflowId: number): Promise<NRWorkflow> {
        try {
            return await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
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
    public async updateWorkflow(@IsInt @PathParam("id") workflowId: number,
                                workflow: NRWorkflow): Promise<NRWorkflow> {

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
        }

        // Update current stored name if given one.
        if (workflow.name) {
            currWorkflow.name = workflow.name;
        }

        // Update creator name if given one.
        if (workflow.creator) {
            currWorkflow.creator = workflow.creator;
        }

        if (workflow.description) {
            currWorkflow.description = workflow.description;
        }

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
    public async deleteWorkflow(@IsInt @PathParam("id") workflowId: number) {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
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
    public async appendStage(stage: NRStage, @IsInt @PathParam("id") workflowId: number): Promise<NRStage> {

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
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
    public async getStages(@IsInt @PathParam("id") workflowId: number): Promise<NRStage[]> {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
        }

        // Grab all the stages for this workflow.
        const stages = await this.stageRepository
            .createQueryBuilder("stage")
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .getMany();

        stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
        
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
    public async getStage(@IsInt @PathParam("id") wid: number, @IsInt @PathParam("sid") sid: number): Promise<NRStage> {

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
        }

        // Grab the specified stage for the right workflow.
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
                            @IsInt @PathParam("id") workflowId: number,
                            @IsInt @PathParam("pos") position: number): Promise<NRStage> {

        // Invalid position.
        if (position < 0) {
            throw new Errors.BadRequestError("Stage position cannot be negative.");
        }

        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
        }

        // Grab the max/min sequenceId for this set of workflow stages.
        const maxSeqId = await this.getMaxStageSequenceId(currWorkflow.id);

        if (maxSeqId == null) { // No stages yet, just add it.
            stage.sequenceId = 0;
        } else if (position > maxSeqId + 1) {
            throw new Errors.BadRequestError("Stage position past bounds.");
        } else { // Insert normally.
            let currSeq = maxSeqId;

            // Update sequences.
            while (currSeq >= 0) {
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
     * Delete the given stage.
     *
     * Returns 400 if:
     *      - Stage properties missing.
     *      - Stage property types incorrect.
     *
     * Returns 404 if:
     *      - Workflow id not found.
     */
    @DELETE
    @Path("/:id/stages/:sid")
    public async deleteStage(@IsInt @PathParam("id") workflowId: number,
                             @PathParam("sid") stageId: number) {

        let currWorkflow: NRWorkflow;
        let currStage: NRStage;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);

        } catch (err) {
            console.error("Error getting Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
        }

        try {
            currStage = await this.stageRepository.findOneOrFail(stageId);
        } catch (err) {
            console.error("Error getting Stage:", err);
            throw new NotFoundError("A Stage with the given ID was not found.");
        }

        const maxSeqId = await this.getMaxStageSequenceId(workflowId);

        await this.stageRepository
            .createQueryBuilder("stage")
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
                .createQueryBuilder("stage")
                .update(NRStage)
                .set({ sequenceId: currSeq - 1 })
                .where("sequenceId = :id ", { id: currSeq })
                .execute();

            currSeq++;
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
    public async updateStage(@IsInt @PathParam("sid") sid: number,
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

        if (stage.description) {
            currStage.description = stage.description;
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
}
