export namespace TriggersAPI {

    // This applies to post/get/put/delete
    export function triggerAPI(sid: number) {
        return `/api/triggers/${sid}`;
    }

    export function getAllTriggers() {
        return '/api/triggers';
    }
}