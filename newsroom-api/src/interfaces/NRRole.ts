import { NRSTPermission } from "./NRSTPermission";
import { NRUser } from "./NRUser";
import { NRWFPermission } from "./NRWFPermission";

export interface NRRole {

    id: number;

    name: string;

    description: string;

    created: Date;

    lastUpdated: Date;

    users: NRUser[];

    wfpermissions: NRWFPermission[];

    stpermissions: NRSTPermission[];

}
