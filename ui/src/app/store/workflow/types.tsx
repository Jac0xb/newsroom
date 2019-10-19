import { NRStage } from "app/utils/models";

// Workflow state 
export interface WorkflowState {
  stages: Array<NRStage>
  flash: string,
  createDialogOpen: boolean,
  editDialogOpen: boolean,
  stageID: number,
  seqID: number,
  dialogTextName: string,
  dialogTextDesc: string,
  canEdit: boolean
  currentStage: NRStage
}
  
// Describing the different ACTION NAMES available
export const SET_PERMISSIONS = "@@workflow/SET_PERMISSIONS";
export const ADD_STAGE = "@@workflow/ADD_STAGE";
export const EDIT_STAGE = "@@workflow/EDIT_STAGE";
export const SET_STAGES = "@@workflow/SET_STAGES";
export const ADD_STAGE_CLICK = "@@workflow/ADD_STAGE_CLICK";
export const EDIT_STAGE_CLICK = "@@workflow/DIT_STAGE_CLICK";
export const TEXT_CHANGE = "@@workflow/TEXT_CHANGE";
export const CLOSE_DIALOG = "@@workflow/CLOSE_DIALOG";
export const EDIT_FLASH = "@@workflow/EDIT_FLASH";
export const STAGE_CHANGE = "@@workflow/STAGE_CHANGE";
  
interface SetPermissionsAction {
  type: typeof SET_PERMISSIONS;
  canEdit: boolean;
}

interface AddStageAction {
  type: typeof ADD_STAGE;
  payload: NRStage;
  index: number;
}

interface EditStageAction {
  type: typeof EDIT_STAGE;
  updatedStage: NRStage
}

interface CloseDialogAction {
  type: typeof CLOSE_DIALOG;
}

interface SetStagesAction {
  type: typeof SET_STAGES;
  payload: Array<NRStage>;
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

interface StageChangeAction {
  type: typeof STAGE_CHANGE;
  seqID: number
}

// Define Dispatchers
export interface WorkflowDispatchers {
  fetchSetPermissions: (canEdit: boolean) => WorkflowActionTypes
  fetchSetStages: (stages: Array<NRStage>) => WorkflowActionTypes
  fetchAddStage: (stage: NRStage, index: number) => WorkflowActionTypes
  fetchStageAddClick: (seqID: number) => WorkflowActionTypes
  fetchTextBoxChange: (fieldName: string, newValue: string) => WorkflowActionTypes
  fetchStageEditClick: (stageID: number, seqID: number, newName: string, newDesc: string) => WorkflowActionTypes
  fetchEditStage: (updatedStage: NRStage) => WorkflowActionTypes
  fetchCloseDialog: () => WorkflowActionTypes
  fetchEditFlash: (flash: string) => WorkflowActionTypes
  fetchStageChange: (seqID: number) => WorkflowActionTypes
}

export type WorkflowActionTypes = 
  AddStageAction 
  | EditStageAction 
  | SetStagesAction 
  | StageAddClickAction 
  | StageTextChangeAction 
  | StageEditClickAction 
  | CloseDialogAction 
  | EditFlashAction
  | SetPermissionsAction
  | StageChangeAction;

  