import { WorkflowActionTypes, SET_PERMISSIONS, ADD_STAGE, EDIT_STAGE, SET_STAGES, ADD_STAGE_CLICK, TEXT_CHANGE, EDIT_FLASH, WorkflowDispatchers, STAGE_CHANGE } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRStage } from "app/utils/models";

export function dispatchSetPermissions(canEdit: boolean): WorkflowActionTypes {
  return {
    type: SET_PERMISSIONS,
    canEdit: canEdit,
  };
}

export function dispatchAddStage(newStage: NRStage, index: number): WorkflowActionTypes {
  return {
    type: ADD_STAGE,
    payload: newStage,
    index: index
  };
}

export function dispatchSetStages(stages: Array<NRStage>): WorkflowActionTypes {
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

export function dispatchStageEdit(stageID: number, name: string, newValue: string) : WorkflowActionTypes {
  return {
    type: EDIT_STAGE,
    stageID: stageID,
    name: name,
    newValue: newValue,
    
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

export function dispatchStageChange(seqID: number) : WorkflowActionTypes {
  return {
    type: STAGE_CHANGE,
    seqID: seqID
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
    fetchEditStage: bindActionCreators(dispatchStageEdit, dispatch),
    fetchEditFlash: bindActionCreators(dispatchEditFlash, dispatch),
    fetchStageChange: bindActionCreators(dispatchStageChange, dispatch),
  }
};