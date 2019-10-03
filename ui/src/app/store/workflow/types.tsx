import { Stage } from "app/models";

// Workflow state 
export interface WorkflowState {
    stages: Array<Stage>
    flash: string,
    createDialogOpen: boolean,
    editDialogOpen: boolean,
    stageID: number,
    seqID: number,
    dialogTextName: string,
    dialogTextDesc: string,
    canEdit: boolean
  }
  
  // Describing the different ACTION NAMES available
  export const ADD_STAGE = "ADD_STAGE";
  export const EDIT_STAGE = "EDIT_STAGE";
  export const SET_STAGES = "SET_STAGES";
  export const ADD_STAGE_CLICK = "ADD_STAGE_CLICK";
  export const EDIT_STAGE_CLICK = "EDIT_STAGE_CLICK";
  export const TEXT_CHANGE = "TEXT_CHANGE";
  export const CLOSE_DIALOG = "CLOSE_DIALOG";
  export const EDIT_FLASH = "EDIT_FLASH";
  
  interface AddStageAction {
    type: typeof ADD_STAGE;
    payload: Stage;
    index: number;
  }

  interface EditStageAction {
    type: typeof EDIT_STAGE;
  }

  interface CloseDialogAction {
    type: typeof CLOSE_DIALOG;
  }

  interface SetStagesAction {
    type: typeof SET_STAGES;
    payload: Array<Stage>;
  }

  interface StageAddClickAction {
    type: typeof ADD_STAGE_CLICK;
    seqID: number;
  }

  interface StageEditClickAction {
    type: typeof EDIT_STAGE_CLICK;
    stageID: number;
    seqID: number;
    name: string;
    desc: string;
  }

  interface StageTextChangeAction {
    type: typeof TEXT_CHANGE;
    fieldName: string;
    newValue: string;
  }

  interface EditFlashAction {
    type: typeof EDIT_FLASH;
    flash: string;
  }

  export type WorkflowActionTypes = AddStageAction | EditStageAction | SetStagesAction | StageAddClickAction | StageTextChangeAction | StageEditClickAction | CloseDialogAction | EditFlashAction;

  