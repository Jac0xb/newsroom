import { UserActionTypes, UserDispatchers, SET_PERMISSIONS, EDIT_FLASH, SET_GROUPS, SET_SELECT } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRRole as NRGroup, NRWorkflow } from "app/utils/models";

export function dispatchSetPermissions(permissions: Array<NRWorkflow>): UserActionTypes {
  return {
    type: SET_PERMISSIONS,
    permissions: permissions,
  };
}
export function dispatchEditFlash(flash: string): UserActionTypes {
  return {
    type: EDIT_FLASH,
    flash: flash
  };
}
export function dispatchSetGroups(groups: Array<NRGroup>): UserActionTypes {
  return {
    type: SET_GROUPS,
    groups: groups
  };
}
export function dispatchSelectChange(name: string, payload: any): UserActionTypes {
  return {
    type: SET_SELECT,
    name: name,
    payload: payload
  };
}

// Map Dispatch
export function mapDispatchToProps<T>(dispatch: ThunkDispatch<any, any, UserActionTypes>, ownProps: T) : UserDispatchers {
  return {
    ...ownProps,
    fetchSetPermissions: bindActionCreators(dispatchSetPermissions, dispatch),
    fetchEditFlash: bindActionCreators(dispatchEditFlash, dispatch),
    fetchSetGroups: bindActionCreators(dispatchSetGroups, dispatch),
    fetchSelectChange: bindActionCreators(dispatchSelectChange, dispatch),
  }
};