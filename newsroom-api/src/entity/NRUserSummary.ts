import { NRRole, NRStage, NRWorkflow } from ".";

import { NRUserSummary as INRUserSummary } from "./../models";

export class NRUserSummary implements INRUserSummary {
    public userWriteWorkflows: Set<NRWorkflow>;
    public userWriteStages: Set<NRStage>;

    public userReadWorkflows: Set<NRWorkflow>;
    public userReadStages: Set<NRStage>;

    public groupWriteWorkflows: Set<NRWorkflow>;
    public groupWriteStages: Set<NRStage>;

    public groupReadWorkflows: Set<NRWorkflow>;
    public groupReadStages: Set<NRStage>;

    public groups: NRRole[];
}
