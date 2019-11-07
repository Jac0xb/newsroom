import { ActionTypes, WorkflowDispatchers } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRStage, NRTrigger, NRWorkflow } from "app/utils/models";
import axios from 'axios';
import { StagesAPI } from "app/api/stage";
import { TriggersAPI } from "app/api/triggers";
import { NRTriggerType } from "../../../../../interfaces";
import { WorkflowsAPI } from "app/api/workflow";

export function dispatchSetPermissions(canEdit: boolean): any {
  return {
    type: ActionTypes.SET_PERMISSIONS,
    canEdit: canEdit,
  };
}

export function dispatchSetStages(wfId: number): any {
  return async (dispatch: any) => {

    var { data: stages } = await axios.get(WorkflowsAPI.getWorkflowStages(wfId));
    var { data: triggers } = await axios.get(TriggersAPI.getTriggers());
    console.log(triggers) // TODO

    dispatch({
      type: ActionTypes.SET_STAGES,
      stages: stages,
      trigger: triggers ? triggers[0] : undefined,
    });
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

export function dispatchAddStage(wfId: number, newStage: NRStage, index: number) : any {

  return async (dispatch: any) => {
      try {
          // Add a new stage
          var { data: stage } = await axios.post(StagesAPI.addStage(wfId, index), newStage)

          var { data: stages } = await axios.get(StagesAPI.getWorkflowStages(wfId))

          // dispatch updates
          dispatch({
              type: ActionTypes.ADD_STAGE, 
              stages: stages,
              currentStage: stage, 
          });

      }
      catch(err) {
        console.log(err)
        dispatch({ type: ActionTypes.EDIT_FLASH, flash: "You lack permissions to add a stage in this workflow." });
      }
  };
}

export function dispatchUpdateStage(wfId: number, updatedStage: NRStage) : any {

  return async (dispatch: any) => {

      try {
          // updated a given stage
          await axios.put(StagesAPI.updateStage(wfId, updatedStage.id), updatedStage)

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
        dispatch({ type: ActionTypes.EDIT_FLASH, flash: "You lack permissions to edit a stage in this workflow." });
      }
  };
}

export function dispatchDeleteStage(wfId: number, stageID: number) : any {

  return async (dispatch: any) => {

      try {
          // updated a given stage
          await axios.delete(StagesAPI.deleteStage(wfId, stageID))

          // Get updated stages
          var { data: stages } = await axios.get(StagesAPI.getWorkflowStages(wfId))
          console.log(stages)

          // dispatch updates
          dispatch({
              type: ActionTypes.DELETE_STAGE, 
              stages: stages,
              currentStage: stages[0]
          });

      }
      catch(err) {
        console.log(err)
        dispatch({ type: ActionTypes.EDIT_FLASH, flash: "You lack permissions to delete a stage in this workflow." });
      }
  };
}

export function fetchWorkflow(id: number) : any {

    return async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.FETCH_REQUEST })

        try {
            
            var { data: workflow } = await axios.get<NRWorkflow>(WorkflowsAPI.getWorkflow(id));
        
            dispatch({
                type: ActionTypes.WORKFLOW_SUCCESS,
                payload: workflow
            });

        }
        catch(err) {
           dispatch({ type: ActionTypes.FETCH_FAILURE });
        }
    };
}


export function dispatchAddTrigger(stage: NRStage, channel: string) : any {

  return async (dispatch: any) => {

      try {

          // const t = new NRTrigger({ name: "trigger", workflows: [1] })
          // 
          var { data: t } = await axios.post(TriggersAPI.postNewTrigger(), {
            type: NRTriggerType.SLACK,
            channelName: channel,
            // documents: NRDocument[],
            workflows: new Array<NRWorkflow>(new NRWorkflow({id: 1}))

          })
          console.log(t)

          // dispatch updates
          // dispatch({
          // });

      }
      catch(err) {
        console.log(err)
        dispatch({ type: ActionTypes.EDIT_FLASH, flash: "You lack permissions to add triggers to this stage." });
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
    fetchEditStage: bindActionCreators(dispatchStageEdit, dispatch),
    fetchEditFlash: bindActionCreators(dispatchEditFlash, dispatch),
    fetchStageChange: bindActionCreators(dispatchStageChange, dispatch),
    fetchUpdateStage: bindActionCreators(dispatchUpdateStage, dispatch),
    fetchDeleteStage: bindActionCreators(dispatchDeleteStage, dispatch),
    fetchAddTrigger: bindActionCreators(dispatchAddTrigger, dispatch),
    fetchWorkflow: bindActionCreators(fetchWorkflow, dispatch)
  }
};