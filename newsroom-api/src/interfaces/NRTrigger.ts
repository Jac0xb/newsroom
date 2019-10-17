import { NRDocument } from "./NRDocument";
import { NRWorkflow } from "./NRWorkflow";

export interface NRTrigger {

    id: number;

    name: string;

    type: NRTriggerType;

    channelName: string;

    documents: NRDocument[];

    workflows: NRWorkflow[];
}

export enum NRTriggerType {
    SLACK = "slack",
}
