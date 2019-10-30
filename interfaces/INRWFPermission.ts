import { INRRole } from "./INRRole";
import { INRWorkflow } from "./INRWorkflow";

export interface INRWFPermission {

    id: number;

    access: number;

    workflow: INRWorkflow;

    role: INRRole;

}
