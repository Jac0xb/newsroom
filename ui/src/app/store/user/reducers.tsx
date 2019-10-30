import { AppState } from "app/store";
import { UserState, ActionTypes, 
} from "./types";

const initialState: UserState = {
  permissions: [],
  flash: "",
  groups: [],
  selectedGroups: [],
  selectedPermissions: [],
  userName: "",
  firstName: "",
  lastName: "",
};

export function userReducer(state = initialState, action: any): UserState {
  switch (action.type) {
    case ActionTypes.SET_PERMISSIONS: {
      return {...state, permissions: action.permissions};
    }
    case ActionTypes.EDIT_FLASH: {
      return {...state, flash: action.flash};
    }
    case ActionTypes.SET_GROUPS: {
      return {...state, groups: action.groups};
    }
    case ActionTypes.SET_SELECT: {
      return {...state, [action.name]: action.payload};
    }
    case ActionTypes.UPDATE_USER: {
      return {...state};
    }
    case ActionTypes.TEXT_CHANGE: {
      return {...state, [action.name]: action.payload};
    }
    default:
      return state;
  }
}

export function mapStateToProps<T>(state: AppState, ownProps: T) { 
  return {...ownProps, ...state.user };
};
