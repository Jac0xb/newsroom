import { AppState } from 'app/store';
import {
    ActionTypes,
    DocumentCreateReducerState
} from "./types";

const initialState: DocumentCreateReducerState = {
    flash: "",
    submitted: false,
    fetchedWorkflows: [],
    selectedWorkflow : undefined,
    name: "",
    description: "",
    pending: false
};

export function documentCreateReducer(state = initialState, action: any): DocumentCreateReducerState {

    switch (action.type) {
        case ActionTypes.FETCH_REQUEST:
            return { ...state, pending: true };
        case ActionTypes.FETCH_FAILURE:
            return { ...state, flash: action.payload, pending: false };
        case ActionTypes.WORKFLOWS_SUCCESS:
            return { ...state, fetchedWorkflows: action.payload || [], pending: false };
        case ActionTypes.INDUCE_FLASH:
            return { ...state, flash: action.payload}
        case ActionTypes.INDUCE_SUBMISSION:
            return { ...state, submitted: true }
        case ActionTypes.UPDATE_WORKFLOW:
            return { ...state, selectedWorkflow: action.payload }
        case ActionTypes.UPDATE_NAME:
                return { ...state, name: action.payload }
        case ActionTypes.UPDATE_PENDING:
            return { ...state, pending: action.payload }               
        default:
            return state;
    }

}

export function mapStateToProps<T>(state: AppState, ownProps: T) {
    return { ...ownProps, ...state.documentCreate };
};