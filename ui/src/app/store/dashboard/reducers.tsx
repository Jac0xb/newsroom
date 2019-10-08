import { AppState } from 'app/store'; 
import _ from "lodash";

import { 
    FETCH_DOCUMENTS_PENDING, 
    FETCH_DOCUMENTS_SUCCESS, 
    FETCH_DOCUMENTS_ERROR, 
    DELETE_DOCUMENT_PENDING,
    DELETE_DOCUMENT_SUCCESS,
    DELETE_DOCUMENT_ERROR,
    DashboardActionTypes, 
    DashboardReducerState 
} from "./types";

const initialState: DashboardReducerState = {
  documents: [],
  pending: false
};

export function dashboardReducer(
    state = initialState,
    action: DashboardActionTypes
): DashboardReducerState {
  switch (action.type) {
    case FETCH_DOCUMENTS_PENDING: 
        return {
            ...state,
            pending: true
        }
    case FETCH_DOCUMENTS_SUCCESS:
        return {
            ...state,
            pending: false,
            documents: action.payload
        }
    case FETCH_DOCUMENTS_ERROR:
        return {
            ...state,
            pending: false,
            error: action.payload
        }

    case DELETE_DOCUMENT_PENDING:
        return {
            ...state,
            pending: false
        }
    case DELETE_DOCUMENT_SUCCESS:
        return {
            ...state,
            pending: false
        }
    case DELETE_DOCUMENT_ERROR:
        return {
            ...state,
            pending: false,
            error: action.payload
        }
    default:
      return state;
  }
}

export function mapStateToProps<T>(state: AppState, ownProps: T) { 
    return {...ownProps, ...state.dashboard };
};