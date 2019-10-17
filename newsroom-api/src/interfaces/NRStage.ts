import { NRDocument } from "./NRDocument";
import { NRSTPermission } from "./NRSTPermission";
import { NRSTUSPermission } from "./NRSTUSPermission";
import { NRUser } from "./NRUser";
import { NRWorkflow } from "./NRWorkflow";

export interface NRStage {

    id: number;

    sequenceId: number;

    name: string;

    description: string;

    created: Date;

    lastUpdated: Date;

    permission: number;

    creator: NRUser;

    workflow: NRWorkflow;

    documents: NRDocument[];

    permissions: NRSTPermission[];

    usrpermissions: NRSTUSPermission[];
}
