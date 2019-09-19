import { WorkflowState, UPDATE_SESSION } from "./types";

export function updateSession(newSession: WorkflowState) {
  return {
    type: UPDATE_SESSION,
    payload: newSession
  };
}
