import axios from 'axios';



export namespace DocumentsAPI {

    export async function getAllDocuments() {
        return await axios.get("/api/documents");
    }

    export async function deleteDocument(id: number) {
        return await axios.delete(`/api/documents/${id}`);
    }

}