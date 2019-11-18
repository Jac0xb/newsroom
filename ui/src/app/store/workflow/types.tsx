import { NRStage, NRWorkflow, NRTrigger } from "app/utils/models";

// Workflow state 
export interface WorkflowState {
  stages: Array<NRStage>;
  flash?: string;
  canEdit: boolean;
  currentStage?: NRStage;
  workflow?: NRWorkflow;
  sidebarClosed : Boolean;
}
  
// Describing the different ACTION NAMES available
export const ActionTypes = {
  SET_PERMISSIONS: "@@workflow/SET_PERMISSIONS",
  ADD_STAGE: "@@workflow/ADD_STAGE",
  EDIT_STAGE: "@@workflow/EDIT_STAGE",
  SET_STAGES: "@@workflow/SET_STAGES",
  SET_STAGE: "@@workflow/SET_STAGE",
  EDIT_FLASH: "@@workflow/EDIT_FLASH",
  STAGE_CHANGE: "@@workflow/STAGE_CHANGE",
  DELETE_STAGE: "@@workflow/DELETE_STAGE",
  WORKFLOW_SUCCESS: "@@workflow/WORKFLOW_SUCCESS",
  FETCH_REQUEST: "@@workflow/FETCH_REQUEST",
  FETCH_FAILURE: "@@workflow/FETCH_FAILURE",
  TOGGLE_SIDEBAR: "@@workflow/TOGGLE_SIDEBAR",
  CLEAR_FLASH: "@@workflow/CLEAR_FLASH"
}

// Define Dispatchers
export interface WorkflowDispatchers {
  fetchSetPermissions: (canEdit: boolean) => any;
  fetchSetStages: (wfId: number) => any;
  fetchAddStage: (wfId: number, stage: NRStage, index: number) => any;
  fetchUpdateStage: (wfId: number, updatedStage: NRStage) => any;
  fetchEditStage: (stageID: number, name: string, newValue: string) => any;
  fetchEditFlash: (flash: string) => any;
  fetchStageChange: (seqID: number) => any;
  fetchDeleteStage: (wfId: number, stageID: number) => any;
  fetchAddTrigger: (stage: NRStage, channel: string) => any;
  fetchDeleteTrigger: (stage: NRStage) => any;
  fetchWorkflow: (id: number) => any;
  toggleSidebar: () => any;
  clearFlash: () => any;
}

  