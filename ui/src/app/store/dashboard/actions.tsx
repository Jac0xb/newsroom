import { ActionTypes, DashboardReducerState } from './types';
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { DocumentsAPI } from 'app/api/document';
import { NRDocument, NRWorkflow, NRStage, } from 'app/utils/models';
import axios from 'axios';
import { WorkflowsAPI } from 'app/api/workflow';
import _ from 'lodash';

export function fetchDocuments() : any {

    return async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.DOCUMENTS_REQUEST })

        try {
            
            var { data: documents } = await axios.get<NRDocument[]>(DocumentsAPI.getAllDocuments());
            
            var unauthorized: number[] = [];

            for (var i = 0; i < documents.length; i++) {
                try {

                    var { data: document } = await axios.get<NRDocument>(DocumentsAPI.getDocument(documents[i].id));
                    documents[i].created = new Date(Date.parse(documents[i].created.toString()));
                    documents[i].lastUpdated = new Date(Date.parse(documents[i].lastUpdated.toString()));
                    documents[i] = new NRDocument({...document as Object, ...documents[i]})

                    var { data: stage } = await axios.get<NRStage>(`/api/documents/stage/${documents[i].stage.id}`);

                    var { data: workflow } = await axios.get<NRWorkflow>(WorkflowsAPI.getWorkflow(documents[i].workflow.id));
                    
                    documents[i].workflow = workflow;
                    //if (stage.permission < 1  && documents[i].permission < 1) {
                    //    unauthorized.push(stage.id);
                    //}

                    //if (!workflow)
                    //        throw new Error("broke");

                    //documents[i].workflow = workflow;

                }
                catch(err) {
                    documents[i].workflow = new NRWorkflow({name: "Undefined", id: -1})
                 }
            }
            
            documents = _.filter(documents, (document: NRDocument, index: number) => {
                return !unauthorized.includes(index)
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