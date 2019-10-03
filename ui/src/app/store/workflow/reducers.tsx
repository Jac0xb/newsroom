import { ADD_STAGE, EDIT_STAGE, SET_STAGES, ADD_STAGE_CLICK, TEXT_CHANGE, EDIT_STAGE_CLICK, CLOSE_DIALOG, WorkflowState, WorkflowActionTypes, EDIT_FLASH } from "./types";

const initialState: WorkflowState = {
  stages: [],
  flash: "",
  createDialogOpen: false,
  editDialogOpen: false,
  stageID: 0,
  seqID: 0,
  dialogTextName: "",
  dialogTextDesc: "",
  canEdit: true
};

export function workflowReducer(
  state = initialState,
  action: WorkflowActionTypes
): WorkflowState {
  switch (action.type) {
    case ADD_STAGE: {
      return {
        ...state,
        stages: [...state.stages.slice(0, action.index), action.payload, ...state.stages.slice(action.index)],
        createDialogOpen: false,

      };
    }
    case EDIT_STAGE: {
      return {
        ...state,
        editDialogOpen: false,
      };
    }
    case CLOSE_DIALOG: {
      return {
        ...state,
        editDialogOpen: false,
        createDialogOpen: false,
      };
    }
    case SET_STAGES: {
      return {
        ...state,
        stages: action.payload,
      };
    }
    case ADD_STAGE_CLICK: {
      return {
        ...state,
        createDialogOpen: true,
        dialogTextName: "",
        dialogTextDesc: "",
        seqID: action.seqID
      };
    }
    case EDIT_STAGE_CLICK: {
      return {
        ...state,
        editDialogOpen: true,
        stageID: action.stageID,
        seqID: action.seqID,
        dialogTextName: action.name,
        dialogTextDesc: action.desc,
      };
    }
    case TEXT_CHANGE: {
      return {
        ...state,
        [action.fieldName]: action.newValue,
      };
    }
    case EDIT_FLASH: {
      return {
        ...state,
        flash: action.flash,
      };
    }
    default:
      return state;
  }
}
