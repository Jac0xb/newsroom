import { NRUser } from "./NRUser";
import { NRWorkflow } from "./NRWorkflow";

export interface NRWFUSPermission {

    id: number;

    access: number;

    workflow: NRWorkflow;

    user: NRUser;

}
