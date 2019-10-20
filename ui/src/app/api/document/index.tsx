export namespace DocumentsAPI {

    export function getAllDocuments() {
        return '/api/documents';
    };

    export function getDocument(id: number) {
        return `/api/documents/${id}`;
    };

    export function deleteDocument(id: number) {
        return `/api/documents/${id}`;
    }

}