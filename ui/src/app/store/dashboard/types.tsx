import { NRDocument } from "app/utils/models";

// Dashboard state 
export interface DashboardReducerState {
    documents: NRDocument[]
    pending?: boolean
    error?: string
}

export const ActionTypes = {
    DOCUMENTS_REQUEST: '@@user/DOCUMENTS_REQUEST',
    DOCUMENTS_SUCCESS: '@@user/DOCUMENTS_SUCCESS',
    DOCUMENTS_FAILURE: '@@user/DOCUMENTS_FAILURE'
}

export interface DashboardDispatchers {
    fetchDocuments: () => any
}