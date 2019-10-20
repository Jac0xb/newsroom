import { ActionTypes, WorkflowDispatchers } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRStage } from "app/utils/models";
import axios from 'axios';
import { StagesAPI } from "app/api/stage";

export function dispatchSetPermissions(canEdit: boolean): any {
  return {
    type: ActionTypes.SET_PERMISSIONS,
    canEdit: canEdit,
  };
}

export function dispatchAddStage(newStage: NRStage, index: number): any {
  return {
    type: ActionTypes.ADD_STAGE,
    payload: newStage,
    index: index
  };
}

export function dispatchSetStages(stages: Array<NRStage>): any {
  return {
    type: ActionTypes.SET_STAGES,
    payload: stages
  };
}

export function dispatchStageAddClick(seqID: number): any {
  return {
    type: ActionTypes.ADD_STAGE_CLICK,
    seqID: seqID
  };
}

export function dispatchStageEdit(stageID: number, name: string, newValue: string) : any {
  return {
    type: ActionTypes.EDIT_STAGE,
    stageID: stageID,
    name: name,
    newValue: newValue,
    
  };
}

export function dispatchEditFlash(flash: string): any {
  return {
    type: ActionTypes.EDIT_FLASH,
    flash: flash
  };
}

export function dispatchStageChange(seqID: number) : any {
  return {
    type: ActionTypes.STAGE_CHANGE,
    seqID: seqID
  };
}

export function dispactchUpdateStage(wfId: number, updatedStage: NRStage) : any {

  return async (dispatch: any) => {

      try {
          // updated a given stage
          await axios.put(StagesAPI.updateStage(wfId, updatedStage.id), updatedStage)
            .then((response) => {
            })
            .catch((error) => {

              if (error.response.status == 403) {
                  // this.props.fetchEditFlash("You lack permissions to edit a stage in this workflow.")
              }
          });

          // Get updated stages
          var { data: stages } = await axios.get(StagesAPI.getWorkflowStages(wfId))

          // dispatch updates
          dispatch({
              type: ActionTypes.SET_STAGES, 
              payload: stages 
          });

      }
      catch(err) {
        console.log(err)
         //dispatch({ type: ActionTypes.FETCH_FAILURE });
      }
  };
}

// Map Dispatch
export function mapDispatchToProps<T>(dispatch: ThunkDispatch<any, any, any>, ownProps: T) : WorkflowDispatchers {
  return {
    ...ownProps,
    fetchSetPermissions: bindActionCreators(dispatchSetPermissions, dispatch),
    fetchSetStages: bindActionCreators(dispatchSetStages, dispatch),
    fetchAddStage: bindActionCreators(dispatchAddStage, dispatch),
    fetchStageAddClick: bindActionCreators(dispatchStageAddClick, dispatch),
    fetchEditStage: bindActionCreators(dispatchStageEdit, dispatch),
    fetchEditFlash: bindActionCreators(dispatchEditFlash, dispatch),
    fetchStageChange: bindActionCreators(dispatchStageChange, dispatch),
    fetchUpdateStage: bindActionCreators(dispactchUpdateStage, dispatch),
  }
};