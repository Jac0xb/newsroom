import axios from 'axios';



export namespace DocumentsAPI {

    export const GETALLDOCUMENTS = '/api/documents';

    export async function deleteDocument(id: number) {
        return await axios.delete(`/api/documents/${id}`);
    }

}