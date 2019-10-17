import { NRRole } from "./NRRole";
import { NRWorkflow } from "./NRWorkflow";

export interface NRWFPermission {

    id: number;

    access: number;

    workflow: NRWorkflow;

    role: NRRole;

}
