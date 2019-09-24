import { ADD_STAGE, UPDATE_ID, WorkflowState, WorkflowActionTypes } from "./types";

const initialState: WorkflowState = {
  stages: [],
  updateStageId: 0
};

export function workflowReducer(
  state = initialState,
  action: WorkflowActionTypes
): WorkflowState {
  switch (action.type) {
    case ADD_STAGE: {
      return {
        stages: [...state.stages, action.payload],
        updateStageId: 0
      };
    }
    case UPDATE_ID: {
      return {
        stages: [],
        updateStageId: action.payload
      };
    }
    default:
      return state;
  }
}
