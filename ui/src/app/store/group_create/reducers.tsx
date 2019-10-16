import { AppState } from 'app/store';
import {
    ActionTypes,
    GroupCreateReducerState
} from "./types";

const initialState: GroupCreateReducerState = {
    flash: "",
    submitted: false,
    fetchedWorkflows: [],
    fetchedStages: [],
    fetchedUsers: [],
    selectedItems : [],
    selectedUsers: [],
    name: "",
    description: "",
    pending: false
};

export function groupCreateReducer(state = initialState, action: any): GroupCreateReducerState {

    switch (action.type) {
        case ActionTypes.FETCH_REQUEST:
            return { ...state, pending: true };
        case ActionTypes.FETCH_FAILURE:
            return { ...state, flash: action.payload, pending: false };
        case ActionTypes.WORKFLOWS_SUCCESS:
            return { ...state, fetchedWorkflows: action.payload || [], pending: false };
        case ActionTypes.STAGES_SUCCESS:
            return { ...state, fetchedStages: action.payload || [], pending: false };
        case ActionTypes.USERS_SUCCESS:
            return { ...state, fetchedUsers: action.payload || [], pending: false };
        case ActionTypes.INDUCE_FLASH:
            return { ...state, flash: action.payload}
        case ActionTypes.INDUCE_SUBMISSION:
            return { ...state, submitted: true }
        case ActionTypes.UPDATE_USERSELECTION:
            return { ...state, selectedUsers: action.payload }
        case ActionTypes.UPDATE_ITEMSELECTION:
            return { ...state, selectedItems: action.payload }
        case ActionTypes.UPDATE_NAME:
                return { ...state, name: action.payload }
        case ActionTypes.UPDATE_DESCRIPTION:
            return { ...state, description: action.payload }
        default:
            return state;
    }

}

export function mapStateToProps<T>(state: AppState, ownProps: T) {
    return { ...ownProps, ...state.groupCreate };
};