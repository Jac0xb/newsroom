export namespace StagesAPI {

    export function getAllStages() {
        return `/api/stages`;
    };

    export function getWorkflowStages(wid: number) {
        return `/api/workflows/${wid}/stages`;
    };

    export function updateStage(wid: number, sid: number) {
        return `/api/workflows/${wid}/stages/${sid}`;
    };

}