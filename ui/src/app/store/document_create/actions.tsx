import { ActionTypes, DocumentCreateReducerState, DocumentCreateDispatchers } from './types'
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RSAA } from 'redux-api-middleware';
import { WorkflowsAPI } from 'app/api/workflow';

export function fetchWorkflows() : any {

    var requestHeaders: HeadersInit = new Headers(
        {'Content-Type': 'application/json'}
    );

    return {
        [RSAA]: {
            endpoint: () => WorkflowsAPI.getAllWorkflows(),
            method: 'GET',
            headers: () => requestHeaders,
            types: [
                ActionTypes.FETCH_REQUEST,
                ActionTypes.WORKFLOWS_SUCCESS,
                ActionTypes.FETCH_FAILURE
            ]
        }
    };
}

export function induceFlash(message = "") : any {
    return {
        type: ActionTypes.INDUCE_FLASH,
        payload: message || ""
    };
}

export function induceSubmission() : any {
    return {
        type: ActionTypes.INDUCE_SUBMISSION,
    };
}

export function updateWorkflow(workflow: number) {
    return {
        type: ActionTypes.UPDATE_WORKFLOW,
        payload: workflow
    };   
}

export function updateName(name: string) {
    return {
        type: ActionTypes.UPDATE_NAME,
        payload: name
    };   
}

export function updatePending(isPending: boolean) {
    return {
        type: ActionTypes.UPDATE_PENDING,
        payload: isPending
    };   
}

export function mapDispatchToProps<T>(dispatch: ThunkDispatch<DocumentCreateDispatchers, any, any>, ownProps: T) : DocumentCreateDispatchers {
    return {
        ...ownProps,
        fetchWorkflows: bindActionCreators(fetchWorkflows, dispatch),
        induceFlash: bindActionCreators(induceFlash, dispatch),
        induceSubmission: bindActionCreators(induceSubmission, dispatch),
        updateWorkflow: bindActionCreators(updateWorkflow, dispatch),
        updateName: bindActionCreators(updateName, dispatch),
        updatePending: bindActionCreators(updatePending, dispatch)
    }
};
