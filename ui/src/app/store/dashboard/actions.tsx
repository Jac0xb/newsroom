import * as Types from "./types";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { NRDocument } from "app/utils/models";

export function dispatchFetchDocumentsPending(): Types.DashboardActionTypes {
    return {
        type: Types.FETCH_DOCUMENTS_PENDING
    };
}

export function dispatchFetchDocumentsSuccess(documents: NRDocument[]): Types.DashboardActionTypes {
    return {
        type: Types.FETCH_DOCUMENTS_SUCCESS,
        payload: documents
    }
}

export function dispatchFetchDocumentsError(error: string): Types.DashboardActionTypes {
    return {
        type: Types.FETCH_DOCUMENTS_ERROR,
        payload: error
    };
}

export function dispatchDeleteDocumentPending(): Types.DashboardActionTypes {
    return {
        type: Types.DELETE_DOCUMENT_PENDING
    };
}

export function dispatchDeleteDocumentSuccess(): Types.DashboardActionTypes {
    return {
        type: Types.DELETE_DOCUMENT_SUCCESS
    }
}
export function dispatchDeleteDocumentError(error: string): Types.DashboardActionTypes {
    return {
        type: Types.DELETE_DOCUMENT_ERROR,
        payload: error
    }
}

export function mapDispatchToProps<T>(dispatch: ThunkDispatch<any, any, Types.DashboardActionTypes>, ownProps: T) : Types.DashboardDispatchers {
    return {
        ...ownProps,
        fetchDocumentsPending: bindActionCreators(dispatchFetchDocumentsPending, dispatch),
        fetchDocumentsSuccess: bindActionCreators(dispatchFetchDocumentsSuccess, dispatch),
        fetchDocumentsError: bindActionCreators(dispatchFetchDocumentsError, dispatch),
        deleteDocumentPending: bindActionCreators(dispatchDeleteDocumentPending, dispatch),
        deleteDocumentSuccess: bindActionCreators(dispatchDeleteDocumentSuccess, dispatch),
        deleteDocumentError: bindActionCreators(dispatchDeleteDocumentError, dispatch)
    }
};