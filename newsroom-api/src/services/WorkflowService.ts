import * as express from "express";
import { NRStage, NRWorkflow } from "orm";
import { getManager } from "typeorm";
import { Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { Tags } from "typescript-rest-swagger";
import { InternalServerError, NotFoundError } from "typescript-rest/dist/server/model/errors";

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
     * Used to interact with any given workflow in the database.
     */
    public workflowRepository = getManager().getRepository(NRWorkflow);

    public stageRepository = getManager().getRepository(NRStage);

    /**
     * Get all workflows that exist in the 'workflow' table under the
     * configured connection.
     */
    @GET
    public getWorkflows(): Promise<NRWorkflow[]> {
        return this.workflowRepository.find();
    }

    /* Create a new entry in the 'workflow' table with the specified
     * information.
     *
     * Returns a 400 if the parameters to create the workflow were not
     * sufficient.
     *      - Wrong types.
     */
    @POST
    @PreProcessor(WorkflowService.createWorkflowValidator)
    public async createWorkflow(workflow: NRWorkflow): Promise<NRWorkflow> {
        // TODO: Catch more exceptions here.
        return await this.workflowRepository.save(workflow);

    }

    /**
     * Get a specific workflow from 'workflow' table based on passed
     * workflow id.
     *
     * Returns a 404 if the workflow is not found.
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

    /* Add a stage to the end of this workflow.
     */
    @Path("/:id/stages")
    @POST
    @PreProcessor(WorkflowService.addStageValidator)
    public async addStage(@PathParam("id") workflowId: number, stage: NRStage): Promise<any> {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }
        if (currWorkflow.stages == null) {
            stage.sequenceId = 1;
            currWorkflow.stages = [stage];
        } else {
            stage.sequenceId = currWorkflow.stages.push(stage);
        }

        // TODO catch errors
        return await this.workflowRepository.save(currWorkflow);
    }

    /* Update an entry in the 'workflow' table with the specified
     * information.
     *
     * Returns a 400 if the parameters to update the document were
     * not sufficient.
     *      - Missing ID.
     */
    @PUT
    @Path("/:id")
    @PreProcessor(WorkflowService.updateWorkflowValidator)
    public async updateWorkflow(workflow: NRWorkflow): Promise<NRWorkflow> {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflow.id);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found");
        }

        // Update current stored name if given one.
        if (workflow.name) {
            currWorkflow.name = workflow.name;
        }

        // TODO: Catch more exceptions here.
        return await this.workflowRepository.save(currWorkflow);
    }
}
