import { AppState } from 'app/store';
import {
    ActionTypes,
    MetaReducerState
} from "./types";

const initialState: MetaReducerState = {
    user: undefined
};

export function metaReducer(state = initialState, action: any): MetaReducerState {

    switch (action.type) {
        case ActionTypes.AUTH_LOGIN:
            return { ...state, user: action.payload };
        case ActionTypes.AUTH_LOGOUT:
            return { user: undefined };
        default:
            return state;
    }

}

export function mapStateToProps<T>(state: AppState, ownProps: T) {
    return { ...ownProps, ...state.meta };
};