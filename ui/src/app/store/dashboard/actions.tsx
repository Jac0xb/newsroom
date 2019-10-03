import { DashboardDispatchers, DashboardActionTypes, FETCH_DOCUMENTS_PENDING, FETCH_DOCUMENTS_SUCCESS, FETCH_DOCUMENTS_ERROR } from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";

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

export function mapDispatchToProps<T>(dispatch: ThunkDispatch<any, any, DashboardActionTypes>, ownProps: T) : DashboardDispatchers {
    return{
        ...ownProps,
        fetchDocumentsPending: bindActionCreators(dispatchFetchDocumentsPending, dispatch),
        fetchDocumentsSuccess: bindActionCreators(dispatchFetchDocumentsSuccess, dispatch),
        fetchDocumentsError: bindActionCreators(dispatchFetchDocumentsError, dispatch)
    }
};