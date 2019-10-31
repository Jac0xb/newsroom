import { NRWorkflow, NRStage, NRUser } from "app/utils/models";

// Group state 
export interface GroupReducerState {
    flash?: string
    submitted: boolean
    fetchedWorkflows: NRWorkflow[]
    fetchedStages: NRStage[]
    fetchedUsers: NRUser[]
    selectedItems : string[]
    selectedUsers: NRUser[]
    name?: string
    description?: string
    pending: boolean
}

export const ActionTypes = {
    FETCH_REQUEST: '@@group/FETCH_REQUEST',
    FETCH_FAILURE: '@@group/FETCH_FAILURE',
    SET_GROUP: '@@group/SET_GROUP',
    WORKFLOWS_SUCCESS: '@@group/WORKFLOWS_SUCCESS',
    STAGES_SUCCESS: '@@group/STAGES_SUCCESS',
    USERS_SUCCESS: '@@group/DOCUMENTS_SUCCESS',
    INDUCE_FLASH: '@@group/INDUCE_FLASH',
    INDUCE_SUBMISSION: '@@group/INDUCE_SUBMISSION',
    UPDATE_USERSELECTION: '@@group/UPDATE_USERSELECTION',
    UPDATE_ITEMSELECTION: '@@group/UPDATE_ITEMSELECTION',
    UPDATE_NAME: '@@group/UPDATE_NAME',
    UPDATE_DESCRIPTION: '@@group/UPDATE_DESCRIPTION',
    CLEARFORM: '@@group/CLEARFORM'
}

export interface GroupDispatchers {
    fetchCurrentGroup: (id: number) => any;
    fetchWorkflows: () => any;
    fetchStages: () => any;
    fetchUsers: () => any;
    induceFlash: (message?: string) => any;
    induceSubmission: () => any;
    updateUserSelection: (users: { name: string, id: number }[]) => any;
    updateItemSelection: (items: string[]) => any;
    updateName: (name: string) => any;
    updateDescription: (description: string) => any;
    clearForm: () => any;
}