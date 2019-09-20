import { WorkflowState, ADD_STATE } from "./types";

export function addStage(newState: WorkflowState) {
  return {
    type: ADD_STATE,
    payload: newState
  };
}
