import { AppState } from "app/store";
import { 
  SET_PERMISSIONS,
  UserState, 
  UserActionTypes, 
  EDIT_FLASH, 
  SET_GROUPS,
  SET_SELECT
} from "./types";

const initialState: UserState = {
  permissions: [],
  flash: "",
  groups: [],
  selectedGroups: [],
  selectedPermissions: [],
};

export function userReducer(
  state = initialState,
  action: UserActionTypes
): UserState {
  switch (action.type) {
    case SET_PERMISSIONS: {
      return {
        ...state,
        permissions: action.permissions,
      };
    }
    case EDIT_FLASH: {
      return {
        ...state,
        flash: action.flash,
      };
    }
    case SET_GROUPS: {
      return {
        ...state,
        groups: action.groups,
      };
    }
    case SET_SELECT: {
      return {
        ...state,
        [action.name]: action.payload,
      };
    }
    default:
      return state;
  }
}

export function mapStateToProps<T>(state: AppState, ownProps: T) { 
  return {...ownProps, ...state.user };
};
