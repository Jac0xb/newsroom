export namespace StagesAPI {

    export function getAllStages() {
        return `/api/stages`;
    };

    export function getWorkflowStages(wid: number) {
        return `/api/workflows/${wid}/stages`;
    };

    export function addStage(wid: number, position: number) {
        return `/api/workflows/${wid}/stages/${position}`;
    };

    export function updateStage(wid: number, sid: number) {
        return `/api/workflows/${wid}/stages/${sid}`;
    };

    export function deleteStage(wid: number, sid: number) {
        return `/api/workflows/${wid}/stages/${sid}`;
    };

}