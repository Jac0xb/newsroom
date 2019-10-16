import { ActionTypes, GroupCreateReducerState, GroupCreateDispatchers } from './types'
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { RSAA } from 'redux-api-middleware';
import { WorkflowsAPI } from 'app/api/workflow';
import { StagesAPI} from 'app/api/stage';
import { UsersAPI } from 'app/api/user'

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


export function fetchStages() : any {

    var requestHeaders: HeadersInit = new Headers(
        {'Content-Type': 'application/json'}
    );

    return {
        [RSAA]: {
            endpoint: () => StagesAPI.getAllStages(),
            method: 'GET',
            headers: () => requestHeaders,
            types: [
                ActionTypes.FETCH_REQUEST,
                ActionTypes.STAGES_SUCCESS,
                ActionTypes.FETCH_FAILURE
            ]
        }
    };
}

export function fetchUsers() : any {

    var requestHeaders: HeadersInit = new Headers(
        {'Content-Type': 'application/json'}
    );

    return {
        [RSAA]: {
            endpoint: () => UsersAPI.getAllUsers(),
            method: 'GET',
            headers: () => requestHeaders,
            types: [
                ActionTypes.FETCH_REQUEST,
                ActionTypes.USERS_SUCCESS,
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

export function updateUserSelection(users: { name: string, id: number }[]) {
    return {
        type: ActionTypes.UPDATE_USERSELECTION,
        payload: users
    };   
}

export function updateItemSelection(items: string[]) {
    return {
        type: ActionTypes.UPDATE_ITEMSELECTION,
        payload: items
    };   
}

export function updateName(name: string) {
    return {
        type: ActionTypes.UPDATE_NAME,
        payload: name
    };   
}

export function updateDescription(description: string) {
    return {
        type: ActionTypes.UPDATE_DESCRIPTION,
        payload: description
    };   
}

export function mapDispatchToProps<T>(dispatch: ThunkDispatch<GroupCreateReducerState, any, any>, ownProps: T) : GroupCreateDispatchers {
    return {
        ...ownProps,
        fetchWorkflows: bindActionCreators(fetchWorkflows, dispatch),
        fetchStages: bindActionCreators(fetchStages, dispatch),
        fetchUsers: bindActionCreators(fetchUsers, dispatch),
        induceFlash: bindActionCreators(induceFlash, dispatch),
        induceSubmission: bindActionCreators(induceSubmission, dispatch),
        updateUserSelection: bindActionCreators(updateUserSelection, dispatch),
        updateItemSelection: bindActionCreators(updateItemSelection, dispatch),
        updateName: bindActionCreators(updateName, dispatch),
        updateDescription: bindActionCreators(updateDescription, dispatch)
    }
};
