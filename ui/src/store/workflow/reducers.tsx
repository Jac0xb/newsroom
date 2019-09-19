import { UPDATE_SESSION, WorkflowState, WorkflowActionTypes } from "./types";

const initialState: WorkflowState = {
  loggedIn: false,
  session: "",
  userName: ""
};

export function workflowReducer(
  state = initialState,
  action: WorkflowActionTypes
): WorkflowState {
  switch (action.type) {
    case UPDATE_SESSION: {
      return {
        ...state,
        ...action.payload
      };
    }
    default:
      return state;
  }
}
