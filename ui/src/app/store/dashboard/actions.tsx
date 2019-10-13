import { ActionTypes, DashboardReducerState } from './types'
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RSAA } from 'redux-api-middleware';
import { DocumentsAPI } from 'app/api/document'

export function fetchDocuments() : any {

    var requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Content-Type', 'application/json');

    return {
        [RSAA]: {
            endpoint: () => DocumentsAPI.GETALLDOCUMENTS,
            method: 'GET',
            headers: () => requestHeaders,
            types: [
                ActionTypes.DOCUMENTS_REQUEST,
                ActionTypes.DOCUMENTS_SUCCESS,
                ActionTypes.DOCUMENTS_FAILURE
            ]
        }
    };
}

export function mapDispatchToProps<T>(dispatch: ThunkDispatch<DashboardReducerState, any, any>, ownProps: T) : any {
    return {
        ...ownProps,
        fetchDocuments: bindActionCreators(fetchDocuments, dispatch)
    }
};