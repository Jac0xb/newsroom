export namespace WorkflowsAPI {

    export function getAllWorkflows() {
        return '/api/workflows';
    };

    export function getWorkflow(id: number) {
        return `/api/workflows/${id}`;
    }

    export function getWorkflowStages(id: number) {
        return `/api/workflows/${id}/stages`;
    }

}