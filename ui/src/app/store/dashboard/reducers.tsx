import { AppState } from 'app/store';
import {
    ActionTypes,
    DashboardReducerState
} from "./types";

const initialState: DashboardReducerState = {
    documents: [],
    pending: false
};

export function dashboardReducer(state = initialState, action: any): DashboardReducerState {

    switch (action.type) {
        case ActionTypes.DOCUMENTS_REQUEST:
            return { ...state, pending: true };
        case ActionTypes.DOCUMENTS_SUCCESS:
            return { documents: action.payload || [] };
        case ActionTypes.DOCUMENTS_FAILURE:
            return { ...state, error: action.payload };
        default:
            return state;
    }

}

export function mapStateToProps<T>(state: AppState, ownProps: T) {
    return { ...ownProps, ...state.dashboard };
};