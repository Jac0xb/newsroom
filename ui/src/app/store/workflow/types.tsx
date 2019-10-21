import { NRStage } from "app/utils/models";

// Workflow state 
export interface WorkflowState {
  stages: Array<NRStage>
  flash: string,
  canEdit: boolean
  currentStage: NRStage
}
  
// Describing the different ACTION NAMES available
export const ActionTypes = {
  SET_PERMISSIONS: "@@workflow/SET_PERMISSIONS",
  ADD_STAGE: "@@workflow/ADD_STAGE",
  EDIT_STAGE: "@@workflow/EDIT_STAGE",
  SET_STAGES: "@@workflow/SET_STAGES",
  EDIT_FLASH: "@@workflow/EDIT_FLASH",
  STAGE_CHANGE: "@@workflow/STAGE_CHANGE",
  DELETE_STAGE: "@@workflow/DELETE_STAGE",
}

// Define Dispatchers
export interface WorkflowDispatchers {
  fetchSetPermissions: (canEdit: boolean) => any
  fetchSetStages: (stages: Array<NRStage>) => any
  fetchAddStage: (wfId: number, stage: NRStage, index: number) => any
  fetchUpdateStage: (wfId: number, updatedStage: NRStage) => any
  fetchEditStage: (stageID: number, name: string, newValue: string) => any
  fetchEditFlash: (flash: string) => any
  fetchStageChange: (seqID: number) => any
  fetchDeleteStage: (wfId: number, stageID: number) => any
}

  