import { NRWorkflow } from "app/utils/models";

// Dashboard state 
export interface DocumentCreateReducerState {
    flash?: string
    submitted: boolean
    fetchedWorkflows: NRWorkflow[]
    selectedWorkflow? : number
    name?: string
    description?: string
    pending: boolean
}

export const ActionTypes = {
    FETCH_REQUEST: '@@document_create/FETCH_REQUEST',
    FETCH_FAILURE: '@@document_create/FETCH_FAILURE',
    WORKFLOWS_SUCCESS: '@@document_create/WORKFLOWS_SUCCESS',
    INDUCE_FLASH: '@@document_create/INDUCE_FLASH',
    INDUCE_SUBMISSION: '@@document_create/INDUCE_SUBMISSION',
    UPDATE_WORKFLOW: '@@document_create/UPDATE_SELECTEDWORKFLOW',
    UPDATE_NAME: '@@document_create/UPDATE_NAME',
    UPDATE_PENDING: '@@document_create/UPDATE_PENDING'
}

export interface DocumentCreateDispatchers {
    fetchWorkflows: () => any;
    induceFlash: (message?: string) => any;
    induceSubmission: () => any;
    updateWorkflow: (workflow: number) => any;
    updateName: (name: string) => any;
    updatePending: (isPending: boolean) => any;
}