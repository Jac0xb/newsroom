import { NRRole as NRGroup, NRDCPermission } from "app/utils/models";

// State 
export interface UserState {
  permissions: Array<NRDCPermission>
  flash: string,
  groups: Array<NRGroup>
}
  
// Describing the different ACTION NAMES available
export const SET_PERMISSIONS = "SET_PERMISSIONS";
export const EDIT_FLASH = "EDIT_FLASH";
export const SET_GROUPS = "SET_GROUPS";
  
interface SetPermissionsAction {
  type: typeof SET_PERMISSIONS;
  permissions: Array<NRDCPermission>;
}
interface EditFlashAction {
  type: typeof EDIT_FLASH;
  flash: string;
}
interface SetGroupsAction {
  type: typeof SET_GROUPS;
  groups: Array<NRGroup>;
}

// Define Dispatchers
export interface UserDispatchers {
  fetchSetPermissions: (permissions: Array<NRDCPermission>) => UserActionTypes
  fetchEditFlash: (flash: string) => UserActionTypes
  fetchSetGroups: (groups: Array<NRGroup>) => UserActionTypes
}

export type UserActionTypes = 
  SetPermissionsAction 
  | EditFlashAction
  | SetGroupsAction;

  