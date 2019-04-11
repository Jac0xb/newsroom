import * as express from "express";
import { Stage, Workflow } from "orm";
import { getManager } from "typeorm";
import { Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";

/* Served in /workflows.
 */
@Path("/workflows")
export class WorkflowService {

    /* When creating a new workflow, we need to validate that it has all the
    * required information to define a workflow. The workflow id should always
    * be blank because it is an auto-generated column.
    */
    private static createWorkflowValidator(req: express.Request): void {
        if (!req.body.name) {
            throw new Errors.BadRequestError("Workflow name not present.");
        }

        if (!(typeof req.body.name === "string")) {
            throw new Errors.BadRequestError("Workflow name was not a string.");
        }

        if (!req.body.creator) {
            throw new Errors.BadRequestError("Workflow creator not present.");
        }

        if (!(typeof req.body.creator === "string")) {
            throw new Errors.BadRequestError("Workflow creator was not a string.");
        }
    }

    /* When updating a workflow, we need to validate that we at least have an id
     * to identify it. Other fields may be empty because only some need to be
     * updated.
     */
    private static updateWorkflowValidator(req: express.Request): void {
        if (!req.body.id) {
            throw new Errors.BadRequestError("Workflow ID not present.");
        }

        if (!(typeof req.body.id === "number")) {
            throw new Errors.BadRequestError("Workflow ID was not a number.");
        }

        if (req.body.name) {
            if (!(typeof req.body.name === "string")) {
                throw new Errors.BadRequestError("Workflow name was not a string.");
            }
        }

        if (req.body.creator) {
            if (!(typeof req.body.creator === "string")) {
                throw new Errors.BadRequestError("Workflow creator was not a string.");
            }
        }
    }

    /* When adding a stage to a workflow, we need to validate that we have
     * the necessary information within the database to create it.
     */
    private static addStageValidator(req: express.Request): void {
        if (!req.body.name) {
            throw new Errors.BadRequestError("Stage name not present.");
        }

        if (!(typeof req.body.name === "string")) {
            throw new Errors.BadRequestError("Stage name was not a string.");
        }

        if (!req.body.creator) {
            throw new Errors.BadRequestError("Stage creator not present.");
        }

        if (!(typeof req.body.creator === "string")) {
            throw new Errors.BadRequestError("Stage creator was not a string.");
        }
    }

    /* When updating a stage, we need to validate that we at least have an id
     * to identify it. Other fields may be empty because only some need to be
     * updated.
     */
    private static updateStageValidator(req: express.Request): void {
        if (!req.body.id) {
            throw new Errors.BadRequestError("Stage ID not present.");
        }

        if (!(typeof req.body.id === "number")) {
            throw new Errors.BadRequestError("Stage ID was not a number.");
        }

        if (req.body.name) {
            if (!(typeof req.body.name === "string")) {
                throw new Errors.BadRequestError("Stage name was not a string.");
            }
        }

        if (req.body.creator) {
            if (!(typeof req.body.creator === "string")) {
                throw new Errors.BadRequestError("Stage creator was not a string.");
            }
        }
    }

    /* Used to interact with any given workflow in the database.
     */
    public workflowRepository = getManager().getRepository(Workflow);

    /* Get all workflows that exist in the 'workflow' table under the
     * configured connection.
     */
    @GET
    public getWorkflows(): Promise<any> {
        return this.workflowRepository.find();
    }

    /* Get a specific workflow from 'workflow' table based on passed
     * workflow id.
     *
     * Returns a 404 if the workflow is not found.
     */
    @Path("/:id")
    @GET
    public getWorkflow(@PathParam("id") id: number): Promise<any> {
        try {
            return this.workflowRepository.findOneOrFail(id);
        } catch (EntityNotFoundError) {
            // TODO: Change to arrow function and update tslint.json config.
            return new Promise<Workflow>(function(resolve, reject) {
                reject({ status: 404 });
                // reject(new EntityNotFoundError("Unable to find workflow with ${id}"));
            });
        }
    }

    /* Create a new entry in the 'workflow' table with the specified
     * information.
     *
     * Returns a 404 if the parameters to create the document were not
     * sufficient.
     *      - Wrong types.
     */
    @POST
    @PreProcessor(WorkflowService.createWorkflowValidator)
    // TODO: Figure out how to allow Swagger to recognize these arguments.
    public async createWorkflow(workflow: Workflow): Promise<any> {
        // TODO: Catch more exceptions here.
        await this.workflowRepository.save(workflow);
    }

    /* Add a stage to the end of this workflow.
     */
    @Path("/:id")
    @POST
    @PreProcessor(WorkflowService.addStageValidator)
    public async addStage(@PathParam("id") workflowId: number, stage: Stage): Promise<any> {
        let currWorkflow: Workflow = null;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (EntityNotFoundError) {
            // TODO: Change to arrow function and update tslint.json config.
            return new Promise<Workflow>(function(resolve, reject) {
                reject({ status: 404 });
                // reject(new EntityNotFoundError("Unable to find workflow with ${id}"));
            });
        }

        console.log(currWorkflow.stages);

        // // Empty linked list.
        // if (currWorkflow.stages == null) {
        //     stage.next = null;
        //     stage.previous = null;
        //     stage.workflow = currWorkflow;

        //     await this.workflowRepository.save(stage);
        // } else {
        //     // Index into the stages array for this workflow.
        //     let currIdx: number = 0;

        //     // Walk to the end.
        //     while (currWorkflow.stages[currIdx] != null) {
        //         currIdx++;
        //     }

        //     let prevStage: Stage = currWorkflow.stages[currIdx];

        //     // Append to the end of the linked list.
    }

    /* Update an entry in the 'workflow' table with the specified
     * information.
     *
     * Returns a 404 if the parameters to update the document were
     * not sufficient.
     *      - Missing ID.
     */
    @PUT
    @PreProcessor(WorkflowService.updateWorkflowValidator)
    // TODO: Figure out how to allow Swagger to recognize these arguments.
    public async updateWorkflow(workflow: Workflow): Promise<any> {
        // TODO: Is there a better way to do this?
        let currWorkflow: Workflow = null;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflow.id);
        } catch (EntityNotFoundError) {
            // TODO: Change to arrow function and update tslint.json config.
            return new Promise<Workflow>(function(resolve, reject) {
                reject({ status: 404 });
                // reject(new EntityNotFoundError("Unable to find workflow with ${id}"));
            });
        }

        // Update current stored name if given one.
        if (workflow.name) {
            currWorkflow.name = workflow.name;
        }

        // TODO: Catch more exceptions here.
        await this.workflowRepository.save(currWorkflow);
    }
}
