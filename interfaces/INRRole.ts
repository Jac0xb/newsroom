import { INRSTPermission } from "./INRSTPermission";
import { INRUser } from "./INRUser";
import { INRWFPermission } from "./INRWFPermission";

export interface INRRole {

    id: number;

    name: string;

    description: string;

    created: Date;

    lastUpdated: Date;

    users: INRUser[];

    wfpermissions: INRWFPermission[];

    stpermissions: INRSTPermission[];

}
