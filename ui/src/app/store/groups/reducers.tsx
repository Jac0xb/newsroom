import { AppState } from 'app/store';
import {
    ActionTypes,
    GroupCreateReducerState
} from "./types";

const initialState: GroupCreateReducerState = {
    flash: "",
    pending: false,
    fetchedRoles: []
};

export function groupCreateReducer(state = initialState, action: any): GroupCreateReducerState {

    switch (action.type) {
        case ActionTypes.FETCH_REQUEST:
            return { ...state, pending: true };
        case ActionTypes.FETCH_FAILURE:
            return { ...state, flash: action.payload, pending: false };
        case ActionTypes.ROLES_SUCCESS:
            return { ...state, fetchedRoles: action.payload || [], pending: false };
        case ActionTypes.INDUCE_FLASH:
            return { ...state, flash: action.payload}
        default:
            return state;
    }

}

export function mapStateToProps<T>(state: AppState, ownProps: T) {
    return { ...ownProps, ...state.groupCreate };
};