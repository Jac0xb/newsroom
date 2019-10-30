export namespace WorkflowsAPI {

    export function getAllWorkflows() {
        return '/api/workflows';
    };

    export function getWorkflow(id: number) {
        return `/api/workflows/${id}`;
    }

}