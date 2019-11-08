import { INRDocument } from "./INRDocument";
import { INRStage } from "./INRStage";
import { INRWorkflow } from "./INRWorkflow";

export interface INRTrigger {

    id: number;

    type: NRTriggerType;

    channelName: string;

    stage: INRStage;

    document: INRDocument;

    workflow: INRWorkflow;

}

export enum NRTriggerType {
    SLACK = "slack",
}
