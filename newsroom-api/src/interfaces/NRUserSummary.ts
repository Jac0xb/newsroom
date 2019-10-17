import { NRRole, NRStage, NRWorkflow } from ".";

export interface NRUserSummary {

    userWriteWorkflows: Set<NRWorkflow>;
    userWriteStages: Set<NRStage>;

    userReadWorkflows: Set<NRWorkflow>;
    userReadStages: Set<NRStage>;

    groupWriteWorkflows: Set<NRWorkflow>;
    groupWriteStages: Set<NRStage>;

    groupReadWorkflows: Set<NRWorkflow>;
    groupReadStages: Set<NRStage>;

    groups: NRRole[];
}
