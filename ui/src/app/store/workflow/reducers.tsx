import { AppState } from "app/store";
import { 
  SET_PERMISSIONS,
  ADD_STAGE,
  EDIT_STAGE, 
  SET_STAGES, 
  ADD_STAGE_CLICK, 
  TEXT_CHANGE, 
  WorkflowState, 
  WorkflowActionTypes, 
  EDIT_FLASH, 
  STAGE_CHANGE
} from "./types";
import { NRStage } from "app/utils/models";

const initialState: WorkflowState = {
  stages: [],
  flash: "",
  createDialogOpen: false,
  editDialogOpen: false,
  stageID: 0,
  seqID: 0,
  stageName: "",
  stageDesc: "",
  canEdit: false,
  currentStage: new NRStage({id: 0, name: "", description: ""}),
};

export function workflowReducer(
  state = initialState,
  action: WorkflowActionTypes
): WorkflowState {
  switch (action.type) {
    case SET_PERMISSIONS: {
      return { ...state, canEdit: action.canEdit, };
    }
    case ADD_STAGE: {
      return { ...state, stages: [...state.stages.slice(0, action.index), action.payload, ...state.stages.slice(action.index)], createDialogOpen: false, };
    }
    case SET_STAGES: {
      return { ...state, stages: action.payload, };
    }
    case ADD_STAGE_CLICK: {
      return {
        ...state,
        createDialogOpen: true,
        stageName: "",
        stageDesc: "",
        seqID: action.seqID
      };
    }
    case EDIT_STAGE: {
      return {
        ...state, 
        currentStage: {...state.currentStage, [action.name]: action.newValue}
      };
    }
    case TEXT_CHANGE: {
      return { ...state, [action.fieldName]: action.newValue, };
    }
    case EDIT_FLASH: {
      return { ...state, flash: action.flash, };
    }
    case STAGE_CHANGE: {
      return { ...state, currentStage: state.stages.find(x => x.sequenceId == action.seqID) || new NRStage};
    }
    default:
      return state;
  }
}

export function mapStateToProps<T>(state: AppState, ownProps: T) { 
  return {...ownProps, ...state.workflow };
};
