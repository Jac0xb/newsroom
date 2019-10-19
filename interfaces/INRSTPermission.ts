import { INRRole } from "./INRRole";
import { INRStage } from "./INRStage";

export interface INRSTPermission {

    id: number;

    access: number;

    stage: INRStage;

    role: INRRole;
}
