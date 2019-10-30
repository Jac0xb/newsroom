import { INRDocument } from "./INRDocument";
import { INRWorkflow } from "./INRWorkflow";

export interface INRTrigger {

    id: number;

    name: string;

    type: NRTriggerType;

    channelName: string;

    documents: INRDocument[];

    workflows: INRWorkflow[];
}

export enum NRTriggerType {
    SLACK = "slack",
}
