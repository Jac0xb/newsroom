import { ActionTypes, GroupCreateReducerState, GroupCreateDispatchers } from './types'
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRRole } from "app/utils/models";
import axios from 'axios';

export function fetchRoles() : any {

    return async (dispatch: any) => {
        
        dispatch({ type: ActionTypes.FETCH_REQUEST })

        try {
            
            var response = await axios.get<NRRole[]>("/api/roles");
        
            dispatch({
                type: ActionTypes.ROLES_SUCCESS,
                payload: response.data
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


export function mapDispatchToProps<T>(dispatch: ThunkDispatch<GroupCreateReducerState, any, any>, ownProps: T) : GroupCreateDispatchers {
    return {
        ...ownProps,
        fetchRoles: bindActionCreators(fetchRoles, dispatch),
        induceFlash: bindActionCreators(induceFlash, dispatch)
    }
};
