import { ActionTypes, DashboardReducerState } from './types';
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RSAA } from 'redux-api-middleware';
import { DocumentsAPI } from 'app/api/document';
import { NRDocument } from 'app/utils/models';
import axios from 'axios';

export function fetchDocuments() : any {

    return () => async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.DOCUMENTS_REQUEST })

        try {
            
            var documents = await axios.get<NRDocument[]>(DocumentsAPI.getAllDocuments());
        
            dispatch({
                type: ActionTypes.DOCUMENTS_SUCCESS,
                payload: documents
            });

        }
        catch(err) {
           dispatch({ type: ActionTypes.DOCUMENTS_FAILURE });
        }
    };
}

export function deleteDocument(id: number) : any {

    return () => async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.DELETE_REQUEST })

        try {
            
            await axios.delete(DocumentsAPI.deleteDocument(id));
        
            dispatch({
                type: ActionTypes.DELETE_SUCCESS,
            });

        }
        catch(err) {
           dispatch({ type: ActionTypes.DELETE_FAILURE });
        }
    };
}

export function mapDispatchToProps<T>(dispatch: ThunkDispatch<DashboardReducerState, any, any>, ownProps: T) : any {
    return {
        ...ownProps,
        fetchDocuments: bindActionCreators(fetchDocuments, dispatch),
        deleteDocument: bindActionCreators(deleteDocument, dispatch)
    }
};