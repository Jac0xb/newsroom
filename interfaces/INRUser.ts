import { INRRole } from "./INRRole";

export interface INRUser {

    id: number;

    userName: string;

    email: string;

    firstName: string;

    lastName: string;

    accessToken: string;

    created: Date;

    lastUpdated: Date;

    roles: INRRole[];

    admin: string;
}
