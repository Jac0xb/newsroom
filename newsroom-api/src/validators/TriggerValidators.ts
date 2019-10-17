import * as express from "express";
import { Errors } from "typescript-rest";
import { NRTrigger } from "../entity";
import { NRTriggerType } from "../interfaces/NRTrigger";

export function createTriggerValidator(req: express.Request): void {
    const trigger = req.body as NRTrigger;

    if (!trigger.name) {
        throw new Errors.BadRequestError("Trigger name not present.");
    }

    if (trigger.name.length > 256) {
        throw new Errors.BadRequestError("Trigger name length is too long, max 256.");
    }

    if (trigger.type === NRTriggerType.SLACK) {
        if (!trigger.channelName) {
            throw new Errors.BadRequestError("Channel name is required for Slack Trigger.");
        }

        if (trigger.channelName.length > 256) {
            throw new Errors.BadRequestError("Channel name length is too long, max 256.");
        }
    } else {
        throw new Errors.BadRequestError("Invalid Trigger type: " + trigger.type);
    }

}

export function updateTriggerValidator(req: express.Request): void {
    const trigger = req.body as NRTrigger;

    if (trigger.name) {
        if (trigger.name.length > 256) {
            throw new Errors.BadRequestError("Trigger name length is too long, max 256.");
        }
    }

    if (trigger.type === NRTriggerType.SLACK) {
        if (trigger.channelName) {
            if (trigger.channelName.length > 256) {
                throw new Errors.BadRequestError("Channel name length is too long, max 256.");
            }
        }
    } else {
        throw new Errors.BadRequestError("Invalid Trigger type: " + trigger.type);
    }
}
