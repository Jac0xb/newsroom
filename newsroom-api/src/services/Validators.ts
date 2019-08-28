import * as express from "express";
import { Errors } from "typescript-rest";
import { NRWorkflow, NRStage, NRDocument } from "../entity";

export module validators {
    /**
     * When creating a new workflow, we need to validate that it has all the
     * required information to define a workflow. The workflow id should always
     * be blank because it is an auto-generated column.
     */
    export function createWorkflowValidator(req: express.Request) {
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
    export function updateWorkflowValidator(req: express.Request) {
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
    export function addStageValidator(req: express.Request) {
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
    export function updateStageValidator(req: express.Request) {
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
     * When creating a new document, we need to validate that it has all the
     * required information to define a document. The document id should always
     * be blank because it is an auto-generated column.
     */
    export function createDocumentValidator(req: express.Request) {
        const document = req.body as NRDocument;

        if (!document.name) {
            throw new Errors.BadRequestError("Document name not present.");
        }

        if (!(typeof document.name === "string")) {
            throw new Errors.BadRequestError("Document name was not a string.");
        }

        if (document.name.length > 256) {
            throw new Errors.BadRequestError("Document name length is too long, max 256.");
        }

        if (!document.creator) {
            throw new Errors.BadRequestError("Document creator not present.");
        }

        if (!(typeof document.creator === "string")) {
            throw new Errors.BadRequestError("Document creator was not a string.");
        }

        if (document.creator.length > 256) {
            throw new Errors.BadRequestError("Document creator length is too long, max 256.");
        }

        if (!document.workflow) {
            throw new Errors.BadRequestError("Document workflow not present.");
        }

        if (!(typeof document.workflow === "number")) {
            throw new Errors.BadRequestError("Document workflow was not a number.");
        }

        if (document.stage) {
            if (!(typeof document.stage === "number")) {
                throw new Errors.BadRequestError("Document stage was not a number.");
            }
        }

        if (document.description) {
            if (!(typeof document.description === "string")) {
                throw new Errors.BadRequestError("Document description was not a string.");
            }

            if (document.description.length > 1000) {
                throw new Errors.BadRequestError("Document description too long, max 1000.");
            }
        }
    }

    /**
     * When updating a document, fields may be empty because only some need to be
     * updated.
     */
    export function updateDocumentValidator(req: express.Request): void {
        const document = req.body as NRDocument;

        if (document.name) {
            if (!(typeof document.name === "string")) {
                throw new Errors.BadRequestError("Document name was not a string.");
            }

            if (document.name.length > 256) {
                throw new Errors.BadRequestError("Document name length is too long, max 256.");
            }
        }

        if (document.creator) {
            if (!(typeof document.creator === "string")) {
                throw new Errors.BadRequestError("Document creator was not a string.");
            }

            if (document.creator.length > 256) {
                throw new Errors.BadRequestError("Document creator length is too long, max 256.");
            }
        }

        if (document.workflow) {
            if (!(typeof document.workflow === "number")) {
                throw new Errors.BadRequestError("Document workflow was not a number.");
            }
        }

        if (document.stage) {
            if (!(typeof document.stage === "number")) {
                throw new Errors.BadRequestError("Document stage was not a number.");
            }
        }

        if (document.content) {
            if (!(typeof document.content === "string")) {
                throw new Errors.BadRequestError("Document content was not a string.");
            }
        }

        if (document.description) {
            if (!(typeof document.description === "string")) {
                throw new Errors.BadRequestError("Document description was not a string.");
            }

            if (document.description.length > 1000) {
                throw new Errors.BadRequestError("Document description length is too long, max 1000.");
            }
        }
    }

}
