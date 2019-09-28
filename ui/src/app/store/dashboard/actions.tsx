import { DashboardActionTypes, FETCH_DOCUMENTS_PENDING, FETCH_DOCUMENTS_SUCCESS, FETCH_DOCUMENTS_ERROR } from "./types";
import { Document } from "app/models";

export function dispatchFetchDocumentsPending(): DashboardActionTypes {
    return {
        type: FETCH_DOCUMENTS_PENDING
    };
}

export function dispatchFetchDocumentsSuccess(documents: Document[]): DashboardActionTypes {
    return {
        type: FETCH_DOCUMENTS_SUCCESS,
        payload: documents
    }
}

export function dispatchFetchDocumentsError(error: string): DashboardActionTypes {
    return {
        type: FETCH_DOCUMENTS_ERROR,
        payload: error
    };
}

// Dispatchers
//export const dispatchFetchDocuments = (newStage: Stage, index: number) => {
//  return (dispatch: Dispatch<WorkflowActionTypes>, getState: () => AppState) => {
//    dispatch(addStage(newStage, index));
//  };
//};