export namespace DocumentsAPI {

    export function getAllDocuments() {
        return '/api/documents';
    };

    export function deleteDocument(id: number) {
        return `/api/documents/${id}`;
    }

}