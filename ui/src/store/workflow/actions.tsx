import { WorkflowState, ADD_STAGE, UPDATE_ID } from "./types";

export function addStage(newStage: WorkflowState) {
  return {
    type: ADD_STAGE,
    payload: newStage
  };
}

export function updateStageId(newID: WorkflowState) {
  return {
    type: UPDATE_ID,
    payload: newID
  };
}
