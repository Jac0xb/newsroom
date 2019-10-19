import { NRRole } from "./NRRole";

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

    admin: boolean;
}
