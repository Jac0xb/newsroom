import { WorkflowActionTypes, ADD_STAGE, SET_STAGES, ADD_STAGE_CLICK } from "./types";
import { Dispatch } from "redux";
import { AppState } from "store";
import { Stage } from "app/models";

export function addStage(newStage: Stage, index: number): WorkflowActionTypes {
  return {
    type: ADD_STAGE,
    payload: newStage,
    index: index
  };
}

export function setStages(stages: Array<Stage>): WorkflowActionTypes {
  return {
    type: SET_STAGES,
    payload: stages
  };
}

export function stageAddClick(seqID: number): WorkflowActionTypes {
  return {
    type: ADD_STAGE_CLICK,
    seqID: seqID
  };
}

// Dispatchers
export const dispatchAddStage = (newStage: Stage, index: number) => {
  return (dispatch: Dispatch<WorkflowActionTypes>, getState: () => AppState) => {
    dispatch(addStage(newStage, index));
  };
};

export const dispatchSetStages = (stages: Array<Stage>) => {
  return (dispatch: Dispatch<WorkflowActionTypes>, getState: () => AppState) => {
    dispatch(setStages(stages));
  };
};

export const dispatchStageAddClick = (seqID: number) => {
  return (dispatch: Dispatch<WorkflowActionTypes>, getState: () => AppState) => {
    dispatch(stageAddClick(seqID));
  };
};
