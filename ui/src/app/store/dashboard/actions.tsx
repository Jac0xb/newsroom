import { ActionTypes, DashboardReducerState } from './types';
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { DocumentsAPI } from 'app/api/document';
import { NRDocument, NRWorkflow } from 'app/utils/models';
import axios from 'axios';
import _ from 'lodash';

export function fetchDocuments() : any {

    return async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.DOCUMENTS_REQUEST })

        try {
            
            var { data: documents } = await axios.get<NRDocument[]>(DocumentsAPI.getAllDocuments());

            for (var i = 0; i < documents.length; i++) {
                try {

                    documents[i].created = new Date(Date.parse(documents[i].created.toString()));
                    documents[i].lastUpdated = new Date(Date.parse(documents[i].lastUpdated.toString()));

                }
                catch(err) {
                    documents[i].workflow = new NRWorkflow({name: "Undefined", id: -1})
                 }
            }
            
            documents = _.filter(documents, (document: NRDocument, index: number) => {
                return !(document.permission == 0);
            })

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

    return async (dispatch: any) => {
        
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