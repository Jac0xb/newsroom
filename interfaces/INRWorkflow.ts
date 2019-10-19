import { INRDocument } from "./INRDocument";
import { INRStage } from "./INRStage";
import { INRUser } from "./INRUser";
import { INRWFPermission } from "./INRWFPermission";

export interface INRWorkflow {

    id: number;

    name: string;

    description: string;

    created: Date;

    lastUpdated: Date;

    permission: number;

    creator: INRUser;

    documents: INRDocument[];

    stages: INRStage[];

    permissions: INRWFPermission[];

}
