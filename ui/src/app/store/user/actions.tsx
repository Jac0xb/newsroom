import { ActionTypes, UserDispatchers } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRRole as NRGroup, NRWorkflow, NRRole } from "app/utils/models";
import { RSAA } from 'redux-api-middleware';
import { UsersAPI } from 'app/api/user'

export function dispatchSetPermissions(permissions: Array<NRWorkflow>): any {
  return {
    type: ActionTypes.SET_PERMISSIONS,
    permissions: permissions,
  };
}
export function dispatchEditFlash(flash: string): any {
  return {
    type: ActionTypes.EDIT_FLASH,
    flash: flash
  };
}
export function dispatchSetGroups(groups: Array<NRRole>): any {
  return {
    type: ActionTypes.SET_GROUPS,
    groups: groups
  };
}
export function dispatchSelectChange(name: string, payload: Array<NRRole>): any {
  return {
    type: ActionTypes.SET_SELECT,
    name: name,
    payload: payload
  };
}
export function dispatchUpdateUser(id: number, payload: NRRole) : any {

  var requestHeaders: HeadersInit = new Headers(
      {'Content-Type': 'application/json'}
  );

  return {
      [RSAA]: {
          endpoint: () => UsersAPI.updateUserRoles(id),
          method: 'PUT',
          headers: () => requestHeaders,
          body: payload,
          types: [
            ActionTypes.UPDATE_USER,
          ]
      }
  };
}
export function dispatchHandleTextChange(name: string, payload: string): any {
  return {
    type: ActionTypes.TEXT_CHANGE,
    name: name,
    payload: payload
  };
}

// Map Dispatch
export function mapDispatchToProps<T>(dispatch: ThunkDispatch<any, any, any>, ownProps: T) : UserDispatchers {
  return {
    ...ownProps,
    fetchSetPermissions: bindActionCreators(dispatchSetPermissions, dispatch),
    fetchEditFlash: bindActionCreators(dispatchEditFlash, dispatch),
    fetchSetGroups: bindActionCreators(dispatchSetGroups, dispatch),
    fetchSelectChange: bindActionCreators(dispatchSelectChange, dispatch),
    fetchUpdateUser: bindActionCreators(dispatchUpdateUser, dispatch),
    fetchHandleTextChange: bindActionCreators(dispatchHandleTextChange, dispatch),
  }
};