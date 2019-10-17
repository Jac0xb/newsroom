
import { NRDocument } from "./NRDocument";
import { NRRole } from "./NRRole";

export interface NRDCPermission {

    id: number;

    access: number;

    document: NRDocument;

    role: NRRole;
}
