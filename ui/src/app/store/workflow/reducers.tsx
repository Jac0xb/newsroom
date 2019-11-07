import { AppState } from "app/store";
import { ActionTypes, WorkflowState } from "./types";
import { NRStage, NRTrigger } from "app/utils/models";

const initialState: WorkflowState = {
  stages: [],
  flash: "",
  canEdit: false,
  workflow: undefined,
  currentStage: new NRStage({id: 0, name: "", description: ""}),
  trigger: new NRTrigger({channelName: ''}),
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
      return { ...state, stages: action.stages, trigger: action.trigger };
    }
    case ActionTypes.DELETE_STAGE: {
      return { ...state, stages: action.stages, currentStage:  action.currentStage };
    }
    case ActionTypes.EDIT_STAGE: {
      if(action.name === "trigger")
        return { ...state, trigger: new NRTrigger({...state.trigger, channelName: action.newValue}) }
      // else
      return { ...state, currentStage: {...state.currentStage, [action.name]: action.newValue} };
    }
    case ActionTypes.EDIT_FLASH: {
      return { ...state, flash: action.flash, };
    }
    case ActionTypes.STAGE_CHANGE: {
      return { ...state, currentStage: state.stages.find(x => x.sequenceId == action.seqID) || new NRStage};
    }
    default:
      return state;
  }
}

export function mapStateToProps<T>(state: AppState, ownProps: T) { 
  return {...ownProps, ...state.workflow };
};
