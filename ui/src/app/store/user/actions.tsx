import { ActionTypes, UserDispatchers } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRRole, NRWorkflow } from "app/utils/models";
import { UsersAPI } from 'app/api/user'
import axios from 'axios';

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

    return () => async (dispatch: any) => {

        try {
            
            await axios.put(UsersAPI.updateUserRoles(id), payload);
        
            dispatch({
                type: ActionTypes.UPDATE_USER
            });

        }
        catch(err) {
           //dispatch({ type: ActionTypes.FETCH_FAILURE });
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