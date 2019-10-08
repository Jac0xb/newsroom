import { WorkflowActionTypes, SET_PERMISSIONS, ADD_STAGE, EDIT_STAGE, SET_STAGES, ADD_STAGE_CLICK, TEXT_CHANGE, EDIT_STAGE_CLICK, CLOSE_DIALOG, EDIT_FLASH, WorkflowDispatchers } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { Stage } from "app/models";

export function dispatchSetPermissions(canEdit: boolean): WorkflowActionTypes {
  return {
    type: SET_PERMISSIONS,
    canEdit: canEdit,
  };
}

export function dispatchAddStage(newStage: Stage, index: number): WorkflowActionTypes {
  return {
    type: ADD_STAGE,
    payload: newStage,
    index: index
  };
}

export function dispatchEditStage(): WorkflowActionTypes {
  return {
    type: EDIT_STAGE,
  };
}

export function dispatchCloseDialog(): WorkflowActionTypes {
  return {
    type: CLOSE_DIALOG,
  };
}

export function dispatchSetStages(stages: Array<Stage>): WorkflowActionTypes {
  return {
    type: SET_STAGES,
    payload: stages
  };
}

export function dispatchStageAddClick(seqID: number): WorkflowActionTypes {
  return {
    type: ADD_STAGE_CLICK,
    seqID: seqID
  };
}

export function dispatchStageEditClick(stageID: number, seqID: number, name: string, desc: string): WorkflowActionTypes {
  return {
    type: EDIT_STAGE_CLICK,
    stageID: stageID,
    seqID: seqID,
    name: name,
    desc: desc,
    
  };
}

export function dispatchTextBoxChange(fieldName: string, newValue: string): WorkflowActionTypes {
  return {
    type: TEXT_CHANGE,
    fieldName: fieldName,
    newValue: newValue
  };
}

export function dispatchEditFlash(flash: string): WorkflowActionTypes {
  return {
    type: EDIT_FLASH,
    flash: flash
  };
}

// Map Dispatch
export function mapDispatchToProps<T>(dispatch: ThunkDispatch<any, any, WorkflowActionTypes>, ownProps: T) : WorkflowDispatchers {
  return {
    ...ownProps,
    fetchSetPermissions: bindActionCreators(dispatchSetPermissions, dispatch),
    fetchSetStages: bindActionCreators(dispatchSetStages, dispatch),
    fetchAddStage: bindActionCreators(dispatchAddStage, dispatch),
    fetchStageAddClick: bindActionCreators(dispatchStageAddClick, dispatch),
    fetchTextBoxChange: bindActionCreators(dispatchTextBoxChange, dispatch),
    fetchStageEditClick: bindActionCreators(dispatchStageEditClick, dispatch),
    fetchCloseDialog: bindActionCreators(dispatchCloseDialog, dispatch),
    fetchEditStage: bindActionCreators(dispatchEditStage, dispatch),
    fetchEditFlash: bindActionCreators(dispatchEditFlash, dispatch),
  }
};