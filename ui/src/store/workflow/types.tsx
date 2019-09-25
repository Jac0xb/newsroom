// Describing the shape of the system's slice of state
export interface WorkflowState {
    stages: Array<any>
    stageId: number
  }
  
  // Describing the different ACTION NAMES available
  export const ADD_STAGE = "ADD_STAGE";
  export const UPDATE_ID = "UPDATE_ID";
  
  interface UpdateWorkflowAction {
    type: typeof ADD_STAGE;
    payload: WorkflowState;
  }

  interface UpdateStageIDAction {
    type: typeof UPDATE_ID;
    payload: number;
  }
  
  export type WorkflowActionTypes = UpdateWorkflowAction | UpdateStageIDAction;
  