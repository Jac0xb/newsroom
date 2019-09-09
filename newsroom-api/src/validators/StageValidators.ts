import * as express from "express";
import { Errors } from "typescript-rest";
import { NRStage } from "../entity";

export function addStageValidator(req: express.Request) {
    const stage = req.body as NRStage;

    if (!stage.name) {
        throw new Errors.BadRequestError("Stage userName not present.");
    }

    if (!(typeof stage.name === "string")) {
        throw new Errors.BadRequestError("Stage userName was not a string.");
    }

    if (!stage.creator) {
        throw new Errors.BadRequestError("Stage creator not present.");
    }

    if (!(typeof stage.creator === "number")) {
        throw new Errors.BadRequestError("Stage creator was not a number.");
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

export function updateStageValidator(req: express.Request) {
    const stage = req.body as NRStage;

    if (stage.name) {
        if (!(typeof stage.name === "string")) {
            throw new Errors.BadRequestError("Stage userName was not a string.");
        }
    }

    if (stage.creator) {
        if (!(typeof stage.creator === "number")) {
            throw new Errors.BadRequestError("Stage creator was not a number.");
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
