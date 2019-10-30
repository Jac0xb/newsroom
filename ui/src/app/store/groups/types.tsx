import { NRRole } from "app/utils/models";

// Dashboard state 
export interface GroupCreateReducerState {
    flash?: string;
    fetchedRoles: NRRole[];
    pending: boolean;
}

export const ActionTypes = {
    FETCH_REQUEST: '@@groups/FETCH_REQUEST',
    FETCH_FAILURE: '@@groups/FETCH_FAILURE',
    ROLES_SUCCESS: '@@groups/ROLES_SUCCESS',
    INDUCE_FLASH: '@@groups/INDUCE_FLASH',
}

export interface GroupCreateDispatchers {
    fetchRoles: () => any;
    induceFlash: (message?: string) => any;
}