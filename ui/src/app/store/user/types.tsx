import { NRRole as NRGroup, NRWorkflow } from "app/utils/models";

// State 
export interface UserState {
  permissions: Array<NRWorkflow>
  flash: string,
  groups: Array<NRGroup>
  selectedGroups: Array<NRGroup>
  selectedPermissions: Array<NRWorkflow>
}
  
// Describing the different ACTION NAMES available
export const SET_PERMISSIONS = "SET_PERMISSIONS";
export const EDIT_FLASH = "EDIT_FLASH";
export const SET_GROUPS = "SET_GROUPS";
export const SET_SELECT = "SET_SELECT";
  
interface SetPermissionsAction {
  type: typeof SET_PERMISSIONS;
  permissions: Array<NRWorkflow>;
}
interface EditFlashAction {
  type: typeof EDIT_FLASH;
  flash: string;
}
interface SetGroupsAction {
  type: typeof SET_GROUPS;
  groups: Array<NRGroup>;
}
interface SelectChangeAction {
  type: typeof SET_SELECT;
  name: string;
  payload: any;
}

// Define Dispatchers
export interface UserDispatchers {
  fetchSetPermissions: (permissions: Array<NRWorkflow>) => UserActionTypes
  fetchEditFlash: (flash: string) => UserActionTypes
  fetchSetGroups: (groups: Array<NRGroup>) => UserActionTypes
  fetchSelectChange: (name: string, payload: any) => UserActionTypes
}

export type UserActionTypes = 
  SetPermissionsAction 
  | EditFlashAction
  | SetGroupsAction
  | SelectChangeAction;

  