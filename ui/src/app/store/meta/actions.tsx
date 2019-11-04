import { ActionTypes, MetaDispatchers, MetaReducerState } from './types'
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { NRUser } from 'app/utils/models';
import axios from 'axios';

function login() {
    return async (dispatch: any) => {
        try {
            
            var { status, data: user } = await axios.get<NRUser>(`/api/currentUser`);

            if (status != 401) {
                dispatch({
                    type: ActionTypes.AUTH_LOGIN,
                    payload: user
                })
            } else {
                throw status;
            }
        } catch (err) {
            dispatch({
                type: ActionTypes.AUTH_LOGIN_FAILED,
                payload: err
            })
        }
    }
}

export function logout(): any {
    return {
        type: ActionTypes.AUTH_LOGOUT
    }
}

export function mapDispatchToProps<T>(dispatch: ThunkDispatch<MetaReducerState, any, any>, ownProps: T): MetaDispatchers {
    return {
        ...ownProps,
        login: bindActionCreators(login, dispatch),
        logout: bindActionCreators(logout, dispatch)
    }
};