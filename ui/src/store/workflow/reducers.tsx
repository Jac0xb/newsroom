import { ADD_STAGE, UPDATE_ID, WorkflowState, WorkflowActionTypes } from "./types";

const initialState: WorkflowState = {
  stages: [],
  stageId: 0
};

export function workflowReducer(
  state = initialState,
  action: WorkflowActionTypes
): WorkflowState {
  switch (action.type) {
    case ADD_STAGE: {
      return {
        stages: [...state.stages, action.payload],
        stageId: 0
      };
    }
    case UPDATE_ID: {
      return {
        stages: [],
        stageId: action.payload
      };
    }
    default:
      return state;
  }
}
