// Describing the shape of the system's slice of state
export interface WorkflowState {
    stages: Array<any>;
  }
  
  // Describing the different ACTION NAMES available
  export const ADD_STATE = "ADD_STATE";
  
  interface AddStageAction {
    type: typeof ADD_STATE;
    payload: WorkflowState;
  }

  export type WorkflowActionTypes = AddStageAction;
  