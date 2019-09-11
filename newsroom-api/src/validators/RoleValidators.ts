import * as express from "express";
import { Errors } from "typescript-rest";
import { NRRole } from "../entity";

export function createRoleValidator(req: express.Request): void {
    const role = req.body as NRRole;

    if (!role.name) {
        throw new Errors.BadRequestError("Role userName not present.");
    }

    if (!(typeof role.name === "string")) {
        throw new Errors.BadRequestError("Role userName was not a string.");
    }

    if (role.name.length > 256) {
        throw new Errors.BadRequestError("Role userName length is too long, max 256.");
    }
}

export function updateRoleValidator(req: express.Request): void {
    const role = req.body as NRRole;

    if (role.name) {
        if (!(typeof role.name === "string")) {
            throw new Errors.BadRequestError("Role userName was not a string.");
        }

        if (role.name.length > 256) {
            throw new Errors.BadRequestError("Role userName length is too long, max 256.");
        }
    }
}
