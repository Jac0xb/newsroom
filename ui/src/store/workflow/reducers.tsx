import { ADD_STAGE, SET_STAGES, ADD_STAGE_CLICK,  WorkflowState, WorkflowActionTypes } from "./types";

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
    default:
      return state;
  }
}
