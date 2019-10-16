import { NRWorkflow, NRStage, NRUser } from "app/utils/models";

// Dashboard state 
export interface GroupCreateReducerState {
    flash?: string
    submitted: boolean
    fetchedWorkflows: NRWorkflow[]
    fetchedStages: NRStage[]
    fetchedUsers: NRUser[]
    selectedItems : string[]
    selectedUsers: { name: string, id: number }[]
    name?: string
    description?: string
    pending: boolean
}

export const ActionTypes = {
    FETCH_REQUEST: '@@group_create/FETCH_REQUEST',
    FETCH_FAILURE: '@@group_create/FETCH_FAILURE',
    WORKFLOWS_SUCCESS: '@@group_create/WORKFLOWS_SUCCESS',
    STAGES_SUCCESS: '@@group_create/STAGES_SUCCESS',
    USERS_SUCCESS: '@@group_create/DOCUMENTS_SUCCESS',
    INDUCE_FLASH: '@@group_create/INDUCE_FLASH',
    INDUCE_SUBMISSION: '@@group_create/INDUCE_SUBMISSION',
    UPDATE_USERSELECTION: '@@group_create/UPDATE_USERSELECTION',
    UPDATE_ITEMSELECTION: '@@group_create/UPDATE_ITEMSELECTION',
    UPDATE_NAME: '@@group_create/UPDATE_NAME',
    UPDATE_DESCRIPTION: '@@group_create/UPDATE_DESCRIPTION',
}

export interface GroupCreateDispatchers {
    fetchWorkflows: () => any;
    fetchStages: () => any;
    fetchUsers: () => any;
    induceFlash: (message?: string) => any;
    induceSubmission: () => any;
    updateUserSelection: (users: { name: string, id: number }[]) => any;
    updateItemSelection: (items: string[]) => any;
    updateName: (name: string) => any;
    updateDescription: (description: string) => any;    
}