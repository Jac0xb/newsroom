import { NRDocComment } from "./NRDocComment";
import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";
import { NRWorkflow } from "./NRWorkflow";

export interface NRDocument {

    id: number;

    googleDocId: string;

    name: string;

    description: string;

    created: Date;

    lastUpdated: Date;

    permission: number;

    creator: NRUser;

    workflow: NRWorkflow;

    stage: NRStage;

    comments: NRDocComment[];
}
