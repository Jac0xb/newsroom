import { NRRole, NRStage, NRWorkflow } from ".";

export class NRUserSummary {
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
