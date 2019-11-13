import { INRDocument } from "./INRDocument";
import { INRSTPermission } from "./INRSTPermission";
import { INRUser } from "./INRUser";
import { INRWorkflow } from "./INRWorkflow";
import { INRTrigger } from "./INRTrigger";

export interface INRStage {

    id: number;

    sequenceId: number;

    name: string;

    description: string;

    created: Date;

    lastUpdated: Date;

    permission: number;

    creator: INRUser;

    workflow: INRWorkflow;

    documents: INRDocument[];

    permissions: INRSTPermission[];

    trigger: INRTrigger;
}
