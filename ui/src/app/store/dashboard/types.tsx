import { NRDocument } from "app/utils/models";

// Dashboard state 
export interface DashboardReducerState {
    documents: NRDocument[]
    pending?: boolean
    error?: string
}

export const ActionTypes = {
    DOCUMENTS_REQUEST: '@@dashboard/DOCUMENTS_REQUEST',
    DOCUMENTS_SUCCESS: '@@dashboard/DOCUMENTS_SUCCESS',
    DOCUMENTS_FAILURE: '@@dashboard/DOCUMENTS_FAILURE',
    DELETE_REQUEST: '@@dashboard/DELETE_REQUEST',
    DELETE_SUCCESS: '@@dashboard/DELETE_SUCCESS',
    DELETE_FAILURE: '@@dashboard/DELETE_FAILURE',
}

export interface DashboardDispatchers {
    fetchDocuments: () => any,
    deleteDocument: (id: number) => any
}