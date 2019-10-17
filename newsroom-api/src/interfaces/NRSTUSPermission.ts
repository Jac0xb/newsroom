import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";

export interface NRSTUSPermission {

    id: number;

    access: number;

    stage: NRStage;

    user: NRUser;
}
