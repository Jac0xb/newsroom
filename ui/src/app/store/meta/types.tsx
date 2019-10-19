export interface MetaReducerState {
    userid?: number;
}

export const ActionTypes = {
    AUTH_LOGIN_FAILED: '@@meta/AUTH_LOGIN_FAILED',
    AUTH_LOGIN: '@@meta/AUTH_LOGIN',
    AUTH_LOGOUT: '@@meta/AUTH_LOGOUT',
}

export interface MetaDispatchers {
    login: () => any,
    logout: () => any
}