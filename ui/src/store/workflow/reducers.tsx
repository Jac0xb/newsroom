import { ADD_STATE, WorkflowState, WorkflowActionTypes } from "./types";

const initialState: WorkflowState = {
  stages: [],
};

export function workflowReducer(
  state = initialState,
  action: WorkflowActionTypes
): WorkflowState {
  switch (action.type) {
    case ADD_STATE: {
      return {
        stages: [...state.stages, action.payload]
      };
    }
    default:
      return state;
  }
}
