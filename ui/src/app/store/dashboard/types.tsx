import { NRDocument } from "app/utils/models";

// Dashboard state 
export interface DashboardReducerState {
    documents: NRDocument[]
    pending: boolean
    error?: string
}

// Describing the different ACTION NAMES available
export const FETCH_DOCUMENTS_PENDING = "FETCH_DOCUMENTS_PENDING";
export const FETCH_DOCUMENTS_SUCCESS = "FETCH_DOCUMENTS_SUCCESS";
export const FETCH_DOCUMENTS_ERROR = "FETCH_DOCUMENTS_ERROR";
export const DELETE_DOCUMENT_PENDING = "DELETE_DOCUMENT_PENDING";
export const DELETE_DOCUMENT_SUCCESS = "DELETE_DOCUMENT_SUCCESS";
export const DELETE_DOCUMENT_ERROR = "DELETE_DOCUMENT_ERROR";

interface FetchDocumentPendingAction {
    type: typeof FETCH_DOCUMENTS_PENDING;
}

interface FetchDocumentSuccessAction {
    type: typeof FETCH_DOCUMENTS_SUCCESS;
    payload: Array<NRDocument>;
}

interface FetchDocumentErrorAction {
    type: typeof FETCH_DOCUMENTS_ERROR;
    payload: string;
}

interface DeleteDocumentPendingAction {
    type: typeof DELETE_DOCUMENT_PENDING;
}

interface DeleteDocumentSuccessAction {
    type: typeof DELETE_DOCUMENT_SUCCESS;
}


interface DeleteDocumentErrorAction {
    type: typeof DELETE_DOCUMENT_ERROR;
    payload: string;
}


export interface DashboardDispatchers {
    fetchDocumentsPending: () => DashboardActionTypes
    fetchDocumentsSuccess: (document: NRDocument[]) => DashboardActionTypes
    fetchDocumentsError: (error: string) => DashboardActionTypes
    deleteDocumentPending: () => DashboardActionTypes
    deleteDocumentSuccess: () => DashboardActionTypes
    deleteDocumentError: (error: string) => DashboardActionTypes
}

export type DashboardActionTypes = 
      FetchDocumentPendingAction 
    | FetchDocumentSuccessAction 
    | FetchDocumentErrorAction
    | DeleteDocumentPendingAction
    | DeleteDocumentSuccessAction
    | DeleteDocumentErrorAction; 