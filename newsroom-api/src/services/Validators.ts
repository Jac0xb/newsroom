import * as express from "express";
import { Errors } from "typescript-rest";

import { NRDocument, NRRole, NRStage, NRUser } from "../entity";

// Validate form submissions on creating and updating items.
export namespace validators {
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

    export function createUserValidator(req: express.Request): void {
        const user = req.body as NRUser;

        if (!user.name) {
            throw new Errors.BadRequestError("User name not present.");
        }

        if (!(typeof user.name === "string")) {
            throw new Errors.BadRequestError("User name was not a string.");
        }

        if (user.name.length > 256) {
            throw new Errors.BadRequestError("User name length is too long, max 256.");
        }

        if (!user.firstName) {
            throw new Errors.BadRequestError("User first name not present.");
        }

        if (!(typeof user.firstName === "string")) {
            throw new Errors.BadRequestError("User first name was not a string.");
        }

        if (user.firstName.length > 256) {
            throw new Errors.BadRequestError("User first name length is too long, max 256.");
        }

        if (!user.lastName) {
            throw new Errors.BadRequestError("User last name not present.");
        }

        if (!(typeof user.lastName === "string")) {
            throw new Errors.BadRequestError("User last name was not a string.");
        }

        if (user.lastName.length > 256) {
            throw new Errors.BadRequestError("User last name length is too long, max 256.");
        }

        if (!user.password) {
            throw new Errors.BadRequestError("User password not present.");
        }

        if (!(typeof user.password === "string")) {
            throw new Errors.BadRequestError("User password was not a string.");
        }

        if (user.password.length > 256) {
            throw new Errors.BadRequestError("User password length is too long, max 256.");
        }
    }

    export function updateUserValidator(req: express.Request): void {
        const user = req.body as NRUser;

        if (user.name) {
            if (!(typeof user.name === "string")) {
                throw new Errors.BadRequestError("User name was not a string.");
            }

            if (user.name.length > 256) {
                throw new Errors.BadRequestError("User name length is too long, max 256.");
            }
        }

        if (user.firstName) {
            if (!(typeof user.firstName === "string")) {
                throw new Errors.BadRequestError("User first name was not a string.");
            }

            if (user.firstName.length > 256) {
                throw new Errors.BadRequestError("User first name length is too long, max 256.");
            }
        }

        if (user.lastName) {
            if (!(typeof user.lastName === "string")) {
                throw new Errors.BadRequestError("User last name was not a string.");
            }

            if (user.lastName.length > 256) {
                throw new Errors.BadRequestError("User last name length is too long, max 256.");
            }
        }

        if (user.password) {
            if (!(typeof user.password === "string")) {
                throw new Errors.BadRequestError("User password was not a string.");
            }

            if (user.password.length > 256) {
                throw new Errors.BadRequestError("User password length is too long, max 256.");
            }
        }
    }

    export function createRoleValidator(req: express.Request): void {
        const role = req.body as NRRole;

        if (!role.name) {
            throw new Errors.BadRequestError("Role name not present.");
        }

        if (!(typeof role.name === "string")) {
            throw new Errors.BadRequestError("Role name was not a string.");
        }

        if (role.name.length > 256) {
            throw new Errors.BadRequestError("Role name length is too long, max 256.");
        }
    }

    export function updateRoleValidator(req: express.Request): void {
        const role = req.body as NRRole;

        if (role.name) {
            if (!(typeof role.name === "string")) {
                throw new Errors.BadRequestError("Role name was not a string.");
            }

            if (role.name.length > 256) {
                throw new Errors.BadRequestError("Role name length is too long, max 256.");
            }
        }
    }
}
