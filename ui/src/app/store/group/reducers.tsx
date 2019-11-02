import { AppState } from 'app/store';
import {
    ActionTypes,
    GroupReducerState
} from "./types";

const initialState: GroupReducerState = {
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

export function groupReducer(state = initialState, action: any): GroupReducerState {

    switch (action.type) {
        case ActionTypes.FETCH_REQUEST:
            return { ...state, pending: true };
        case ActionTypes.FETCH_FAILURE:
            return { ...state, flash: action.payload, pending: false };
        case ActionTypes.SET_GROUP:
            return { ...state, name: action.name, description: action.description, selectedItems: action.selectedPermissions || [], selectedUsers: action.selectedUsers || [], pending: false };
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
        case ActionTypes.CLEARFORM:
            return  {...initialState};
        default:
            return state;
    }

}

export function mapStateToProps<T>(state: AppState, ownProps: T) {
    return { ...ownProps, ...state.group };
};