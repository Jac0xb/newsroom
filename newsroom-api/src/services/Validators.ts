import * as express from "express";
import { Errors } from "typescript-rest";

import { NRDocument, NRRole, NRStage, NRUser } from "../entity";

// Validate form submissions on creating and updating items.
export namespace validators {

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
