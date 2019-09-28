import { FETCH_DOCUMENTS_PENDING, FETCH_DOCUMENTS_SUCCESS, FETCH_DOCUMENTS_ERROR, DashboardActionTypes, DashboardState } from "./types";

const initialState: DashboardState = {
  documents: [],
  pending: false
};

export function dashboardReducer(
    state = initialState,
    action: DashboardActionTypes
): DashboardState {
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
    default:
      return state;
  }
}
