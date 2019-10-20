import { AppState } from "app/store";
import { ActionTypes, WorkflowState } from "./types";
import { NRStage } from "app/utils/models";

const initialState: WorkflowState = {
  stages: [],
  flash: "",
  canEdit: false,
  currentStage: new NRStage({id: 0, name: "", description: ""}),
};

export function workflowReducer( state = initialState, action: any): WorkflowState {
  switch (action.type) {
    case ActionTypes.SET_PERMISSIONS: {
      return { ...state, canEdit: action.canEdit, };
    }
    case ActionTypes.ADD_STAGE: {
      return { ...state, stages: [...state.stages.slice(0, action.index), action.payload, ...state.stages.slice(action.index)] };
    }
    case ActionTypes.SET_STAGES: {
      return { ...state, stages: action.payload, };
    }
    case ActionTypes.ADD_STAGE_CLICK: {
      return {
        ...state,
        //todo
      };
    }
    case ActionTypes.EDIT_STAGE: {
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
