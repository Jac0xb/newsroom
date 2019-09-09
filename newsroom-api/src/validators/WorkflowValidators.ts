import * as express from "express";
import { Errors } from "typescript-rest";
import { NRWorkflow } from "../entity";

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

    if (!(typeof workflow.creator === "number")) {
        throw new Errors.BadRequestError("Workflow creator was not a number.");
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

export function updateWorkflowValidator(req: express.Request) {
    const workflow = req.body as NRWorkflow;

    if (workflow.name) {
        if (!(typeof workflow.name === "string")) {
            throw new Errors.BadRequestError("Workflow name was not a string.");
        }
    }

    if (workflow.creator) {
        if (!(typeof workflow.creator === "number")) {
            throw new Errors.BadRequestError("Workflow creator was not a number.");
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
