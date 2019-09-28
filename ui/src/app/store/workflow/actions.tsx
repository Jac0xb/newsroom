import { WorkflowActionTypes, ADD_STAGE, EDIT_STAGE, SET_STAGES, ADD_STAGE_CLICK, TEXT_CHANGE, EDIT_STAGE_CLICK } from "./types";
import { Dispatch } from "redux";
import { AppState } from "app/store";
import { Stage } from "app/models";

export function addStage(newStage: Stage, index: number): WorkflowActionTypes {
  return {
    type: ADD_STAGE,
    payload: newStage,
    index: index
  };
}

export function editStage(): WorkflowActionTypes {
  return {
    type: EDIT_STAGE,
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

// dialogTextName, dialogTextDesc, editDialogOpen: true, stageID, seqID
export function stageEditClick(stageID: number, seqID: number, name: string, desc: string): WorkflowActionTypes {
  return {
    type: EDIT_STAGE_CLICK,
    stageID: stageID,
    seqID: seqID,
    name: name,
    desc: desc,
    
  };
}

export function textBoxChange(fieldName: string, newValue: string): WorkflowActionTypes {
  return {
    type: TEXT_CHANGE,
    fieldName: fieldName,
    newValue: newValue
  };
}

// Dispatchers
export const dispatchAddStage = (newStage: Stage, index: number) => {
  return (dispatch: Dispatch<WorkflowActionTypes>, getState: () => AppState) => {
    dispatch(addStage(newStage, index));
  };
};

export const dispatchEditStage = () => {
  return (dispatch: Dispatch<WorkflowActionTypes>, getState: () => AppState) => {
    dispatch(editStage());
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

export const dispatchStageEditClick = (stageID: number, seqID: number, name: string, desc: string) => {
  return (dispatch: Dispatch<WorkflowActionTypes>, getState: () => AppState) => {
    dispatch(stageEditClick(stageID, seqID, name, desc));
  };
};

export const dispatchTextBoxChange = (fieldName: string, newValue: string) => {
  return (dispatch: Dispatch<WorkflowActionTypes>, getState: () => AppState) => {
    dispatch(textBoxChange(fieldName, newValue));
  };
};
