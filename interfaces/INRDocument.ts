import { INRDocComment } from "./INRDocComment";
import { INRStage } from "./INRStage";
import { INRUser } from "./INRUser";
import { INRWorkflow } from "./INRWorkflow";

export interface INRDocument {

    id: number;

    googleDocId: string;

    name: string;

    description: string;

    created: Date;

    lastUpdated: Date;

    permission: number;

    creator: INRUser;

    workflow: INRWorkflow;

    stage: INRStage;

    comments: INRDocComment[];
}
