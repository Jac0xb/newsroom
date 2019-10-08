import { Permissions } from "app/models/permissions";
import { Group } from "app/models";

// State 
export interface UserState {
  permissions: Array<Permissions>
  flash: string,
  groups: Array<Group>
}
  
// Describing the different ACTION NAMES available
export const SET_PERMISSIONS = "SET_PERMISSIONS";
export const EDIT_FLASH = "EDIT_FLASH";
export const SET_GROUPS = "SET_GROUPS";
  
interface SetPermissionsAction {
  type: typeof SET_PERMISSIONS;
  permissions: Array<Permissions>;
}
interface EditFlashAction {
  type: typeof EDIT_FLASH;
  flash: string;
}
interface SetGroupsAction {
  type: typeof SET_GROUPS;
  groups: Array<Group>;
}

// Define Dispatchers
export interface UserDispatchers {
  fetchSetPermissions: (permissions: Array<Permissions>) => UserActionTypes
  fetchEditFlash: (flash: string) => UserActionTypes
  fetchSetGroups: (groups: Array<Group>) => UserActionTypes
}

export type UserActionTypes = 
  SetPermissionsAction 
  | EditFlashAction
  | SetGroupsAction;

  