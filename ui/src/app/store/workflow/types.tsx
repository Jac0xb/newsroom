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

// Define Dispatchers
export interface WorkflowDispatchers {
  fetchSetPermissions: (canEdit: boolean) => any
  fetchSetStages: (stages: Array<NRStage>) => any
  fetchAddStage: (stage: NRStage, index: number) => any
  fetchStageAddClick: (seqID: number) => any
  fetchTextBoxChange: (fieldName: string, newValue: string) => any
  fetchStageEditClick: (stageID: number, seqID: number, newName: string, newDesc: string) => any
  fetchEditStage: (updatedStage: NRStage) => any
  fetchCloseDialog: () => any
  fetchEditFlash: (flash: string) => any
  fetchStageChange: (seqID: number) => any
}