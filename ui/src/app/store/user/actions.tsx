import { UserActionTypes, UserDispatchers, SET_PERMISSIONS, EDIT_FLASH, SET_GROUPS } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRRole as NRGroup, NRDCPermission } from "app/utils/models";

export function dispatchSetPermissions(permissions: Array<NRDCPermission>): UserActionTypes {
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

// Map Dispatch
export function mapDispatchToProps<T>(dispatch: ThunkDispatch<any, any, UserActionTypes>, ownProps: T) : UserDispatchers {
  return {
    ...ownProps,
    fetchSetPermissions: bindActionCreators(dispatchSetPermissions, dispatch),
    fetchEditFlash: bindActionCreators(dispatchEditFlash, dispatch),
    fetchSetGroups: bindActionCreators(dispatchSetGroups, dispatch),
  }
};