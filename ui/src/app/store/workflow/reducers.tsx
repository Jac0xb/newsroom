import { AppState } from "app/store";
import { ActionTypes, WorkflowState } from "./types";
import { NRStage, NRTrigger } from "app/utils/models";

const initialState: WorkflowState = {
  stages: [],
  flash: "",
  canEdit: false,
  workflow: undefined,
  sidebarClosed: false
};

export function workflowReducer( state = initialState, action: any): WorkflowState {
  switch (action.type) {
    case ActionTypes.WORKFLOW_SUCCESS: {
        return { ...state, workflow: action.payload };
      }
    case ActionTypes.SET_PERMISSIONS: {
      return { ...state, canEdit: action.canEdit, };
    }
    case ActionTypes.ADD_STAGE: {
      return { ...state, stages: action.stages, currentStage: action.currentStage };
    }
    case ActionTypes.SET_STAGES: {
      return { ...state, stages: action.stages };
    }
    case ActionTypes.DELETE_STAGE: {
      return { ...state, stages: action.stages, currentStage:  action.currentStage };
    }
    case ActionTypes.EDIT_STAGE: {

        if (state.currentStage == undefined) 
            return {...state};

        if (action.name === "trigger"){

            return { ...state, currentStage: new NRStage({...state.currentStage, trigger: { ...state.currentStage.trigger, channelName: action.newValue}}) };
        }

        return { ...state, currentStage: new NRStage({...state.currentStage, [action.name]: action.newValue}) };
    }
    case ActionTypes.EDIT_FLASH: {
        return { ...state, flash: action.flash, };
    }
    case ActionTypes.STAGE_CHANGE: {
        return { ...state, currentStage: state.stages.find(x => x.sequenceId == action.seqID)};
    }
    case ActionTypes.TOGGLE_SIDEBAR: {
        return {...state, sidebarClosed: !state.sidebarClosed};
    }
    case ActionTypes.CLEAR_FLASH: {
        return {...state, flash: ""};
    }
    case ActionTypes.CLEAR_DATA: {
        return {...initialState}
    }
    default:
      return state;
  }
}

export function mapStateToProps<T>(state: AppState, ownProps: T) { 
  return {...ownProps, ...state.workflow };
};
