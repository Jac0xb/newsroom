import { NRDocument } from "./NRDocument";
import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";
import { NRWFPermission } from "./NRWFPermission";
import { NRWFUSPermission } from "./NRWFUSPermission";

export interface NRWorkflow {

    id: number;

    name: string;

    description: string;

    created: Date;

    lastUpdated: Date;

    permission: number;

    creator: NRUser;

    documents: NRDocument[];

    stages: NRStage[];

    permissions: NRWFPermission[];

    usrpermissions: NRWFUSPermission[];

}
