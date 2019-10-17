import { NRDocument } from "./NRDocument";
import { NRUser } from "./NRUser";

export interface NRDCUSPermission {

    id: number;

    access: number;

    document: NRDocument;

    user: NRUser;
}
