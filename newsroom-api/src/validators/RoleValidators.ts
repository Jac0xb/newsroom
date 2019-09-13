import * as express from "express";
import { Errors } from "typescript-rest";
import { NRRole } from "../entity";

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
