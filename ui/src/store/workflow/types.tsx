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
  export const SET_STAGES = "SET_STAGES";
  export const ADD_STAGE_CLICK = "ADD_STAGE_CLICK";
  
  interface AddStageAction {
    type: typeof ADD_STAGE;
    payload: Stage;
    index: number;
  }

  interface SetStagesAction {
    type: typeof SET_STAGES;
    payload: Array<Stage>;
  }

  interface StageAddClickAction {
    type: typeof ADD_STAGE_CLICK;
    seqID: number;
  }

  export type WorkflowActionTypes = AddStageAction | SetStagesAction | StageAddClickAction;

  