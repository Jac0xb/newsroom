import { AppState } from 'app/store';
import {
    ActionTypes,
    MetaReducerState
} from "./types";

const initialState: MetaReducerState = {
    userid: undefined
};

export function metaReducer(state = initialState, action: any): MetaReducerState {

    switch (action.type) {
        case ActionTypes.AUTH_LOGIN:
            return { ...state, userid: action.payload };
        case ActionTypes.AUTH_LOGOUT:
            return { userid: undefined };
        default:
            return state;
    }

}

export function mapStateToProps<T>(state: AppState, ownProps: T) {
    return { ...ownProps, ...state.meta };
};