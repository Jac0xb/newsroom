import * as express from "express";
import { Errors } from "typescript-rest";
import { NRDocument } from "../entity";

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

    if (!(typeof document.creator === "number")) {
        throw new Errors.BadRequestError("Document creator was not a number.");
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
        if (!(typeof document.creator === "number")) {
            throw new Errors.BadRequestError("Document creator was not a number.");
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
