import { Document } from "app/models";

// Workflow state 
export interface DashboardState {
    documents: Document[]
    pending: boolean
    error?: string
}
  
// Describing the different ACTION NAMES available
export const FETCH_DOCUMENTS_PENDING = "FETCH_DOCUMENTS_PENDING";
export const FETCH_DOCUMENTS_SUCCESS = "FETCH_DOCUMENTS_SUCCESS";
export const FETCH_DOCUMENTS_ERROR = "FETCH_DOCUMENTS_ERROR";

interface FetchDocumentPendingAction {
    type: typeof FETCH_DOCUMENTS_PENDING;
}

interface FetchDocumentSuccessAction {
    type: typeof FETCH_DOCUMENTS_SUCCESS;
    payload: Array<Document>
}

interface FetchDocumentErrorAction {
    type: typeof FETCH_DOCUMENTS_ERROR;
    payload: string
}

export type DashboardActionTypes = 
    FetchDocumentPendingAction 
    | FetchDocumentSuccessAction 
    | FetchDocumentErrorAction; 