import { ActionTypes, GroupCreateReducerState, GroupCreateDispatchers } from './types'
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { WorkflowsAPI } from 'app/api/workflow';
import { NRWorkflow, NRStage, NRUser } from 'app/utils/models'
import { StagesAPI} from 'app/api/stage';
import { UsersAPI } from 'app/api/user'
import axios from 'axios';

export function fetchWorkflows() : any {

    return async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.FETCH_REQUEST })

        try {
            
            var workflows = await axios.get<NRWorkflow[]>(WorkflowsAPI.getAllWorkflows());
        
            dispatch({
                type: ActionTypes.WORKFLOWS_SUCCESS,
                payload: workflows.data
            });

        }
        catch(err) {
           dispatch({ type: ActionTypes.FETCH_FAILURE });
        }
    };
}


export function fetchStages() : any {
    return async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.FETCH_REQUEST })

        try {
            
            var stages = await axios.get<NRStage[]>(StagesAPI.getAllStages());
        
            dispatch({
                type: ActionTypes.STAGES_SUCCESS,
                payload: stages.data
            });

        }
        catch(err) {
           dispatch({ type: ActionTypes.FETCH_FAILURE });
        }
    };
}

export function fetchUsers() : any {
    return async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.FETCH_REQUEST })

        try {
            
            var users = await axios.get<NRUser[]>(UsersAPI.getAllUsers());
        
            dispatch({
                type: ActionTypes.USERS_SUCCESS,
                payload: users.data
            });

        }
        catch(err) {
           dispatch({ type: ActionTypes.FETCH_FAILURE });
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
