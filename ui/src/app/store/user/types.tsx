import { NRRole as NRGroup, NRWorkflow, NRRole } from "app/utils/models";

// State 
export interface UserState {
  permissions: Array<NRWorkflow>
  flash: string,
  groups: Array<NRRole>
  selectedGroups: Array<NRRole>
  selectedPermissions: Array<NRWorkflow>
}
  
// Describing the different ACTION NAMES available
export const ActionTypes = {
  SET_PERMISSIONS: "SET_PERMISSIONS", 
  EDIT_FLASH: "EDIT_FLASH",
  SET_GROUPS:"SET_GROUPS",
  SET_SELECT:"SET_SELECT",
  UPDATE_USER: "UPDATE_USER",
}

// export const SET_PERMISSIONS = "SET_PERMISSIONS";
// export const EDIT_FLASH = "EDIT_FLASH";
// export const SET_GROUPS = "SET_GROUPS";
// export const SET_SELECT = "SET_SELECT";
  
// interface SetPermissionsAction {
//   type: typeof SET_PERMISSIONS;
//   permissions: Array<NRWorkflow>;
// }
// interface EditFlashAction {
//   type: typeof EDIT_FLASH;
//   flash: string;
// }
// interface SetGroupsAction {
//   type: typeof SET_GROUPS;
//   groups: Array<NRGroup>;
// }
// interface SelectChangeAction {
//   type: typeof SET_SELECT;
//   name: string;
//   payload: any;
// }

// Define Dispatchers
export interface UserDispatchers {
  fetchSetPermissions: (permissions: Array<NRWorkflow>) => any
  fetchEditFlash: (flash: string) => any
  fetchSetGroups: (groups: Array<NRRole>) => any
  fetchSelectChange: (name: string, payload: Array<NRRole>) => any
  fetchUpdateUser: (id: number, payload: any) => any
}

// export type UserActionTypes = 
//   SetPermissionsAction 
//   | EditFlashAction
//   | SetGroupsAction
//   | SelectChangeAction;

  