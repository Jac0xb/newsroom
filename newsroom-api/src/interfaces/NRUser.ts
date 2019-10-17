import { NRDCUSPermission } from "./NRDCUSPermission";
import { NRRole } from "./NRRole";
import { NRSTUSPermission } from "./NRSTUSPermission";
import { NRWFUSPermission } from "./NRWFUSPermission";

export interface NRUser {

    id: number;

    userName: string;

    email: string;

    firstName: string;

    lastName: string;

    accessToken: string;

    created: Date;

    lastUpdated: Date;

    roles: NRRole[];

    wfpermissions: NRWFUSPermission[];

    stpermissions: NRSTUSPermission[];

    dcpermissions: NRDCUSPermission[];

}
