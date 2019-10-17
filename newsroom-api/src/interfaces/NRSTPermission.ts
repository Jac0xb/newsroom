import { NRRole } from "./NRRole";
import { NRStage } from "./NRStage";

export interface NRSTPermission {

    id: number;

    access: number;

    stage: NRStage;

    role: NRRole;
}
