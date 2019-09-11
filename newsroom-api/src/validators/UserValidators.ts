import * as express from "express";
import { Errors } from "typescript-rest";
import { NRUser } from "../entity";

export function createUserValidator(req: express.Request): void {
    const user = req.body as NRUser;

    if (!user.userName) {
        throw new Errors.BadRequestError("User userName not present.");
    }

    if (!(typeof user.userName === "string")) {
        throw new Errors.BadRequestError("User userName was not a string.");
    }

    if (user.userName.length > 256) {
        throw new Errors.BadRequestError("User userName length is too long, max 256.");
    }

    if (!user.firstName) {
        throw new Errors.BadRequestError("User first userName not present.");
    }

    if (!(typeof user.firstName === "string")) {
        throw new Errors.BadRequestError("User first userName was not a string.");
    }

    if (user.firstName.length > 256) {
        throw new Errors.BadRequestError("User first userName length is too long, max 256.");
    }

    if (!user.lastName) {
        throw new Errors.BadRequestError("User last userName not present.");
    }

    if (!(typeof user.lastName === "string")) {
        throw new Errors.BadRequestError("User last userName was not a string.");
    }

    if (user.lastName.length > 256) {
        throw new Errors.BadRequestError("User last userName length is too long, max 256.");
    }
}

export function updateUserValidator(req: express.Request): void {
    const user = req.body as NRUser;

    if (user.userName) {
        if (!(typeof user.userName === "string")) {
            throw new Errors.BadRequestError("User userName was not a string.");
        }

        if (user.userName.length > 256) {
            throw new Errors.BadRequestError("User userName length is too long, max 256.");
        }
    }

    if (user.email) {
        if (!(typeof user.email === "string")) {
            throw new Errors.BadRequestError("User userName was not a string.");
        }

        if (user.email.length > 500) {
            throw new Errors.BadRequestError("User userName length is too long, max 256.");
        }
    }

    if (user.firstName) {
        if (!(typeof user.firstName === "string")) {
            throw new Errors.BadRequestError("User first userName was not a string.");
        }

        if (user.firstName.length > 256) {
            throw new Errors.BadRequestError("User first userName length is too long, max 256.");
        }
    }

    if (user.lastName) {
        if (!(typeof user.lastName === "string")) {
            throw new Errors.BadRequestError("User last userName was not a string.");
        }

        if (user.lastName.length > 256) {
            throw new Errors.BadRequestError("User last userName length is too long, max 256.");
        }
    }
}
