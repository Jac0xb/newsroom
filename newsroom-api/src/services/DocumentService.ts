import * as express from "express";
import { Document } from "orm";
import { getManager } from "typeorm";
import { Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";

/* Served in /documents.
 */
@Path("/documents")
export class DocumentService {

    /* When creating a new document, we need to validate that it has all the
    * required information to define a document. The document id should always
    * be blank because it is an auto-generated column.
    */
    private static createDocumentValidator(req: express.Request): void {
        if (!req.body.name) {
            throw new Errors.BadRequestError("Document name not present.");
        }

        if (!(typeof req.body.name === "string")) {
            throw new Errors.BadRequestError("Document name was not a string.");
        }

        if (!req.body.workflow) {
            throw new Errors.BadRequestError("Document workflow not present.");
        }

        if (!(typeof req.body.workflow === "number")) {
            throw new Errors.BadRequestError("Document workflow was not a number.");
        }
    }

    /* When updating a document, we need to validate that we at least have an id
     * to identify it. Other fields may be empty because only some need to be
     * updated.
     */
    private static updateDocumentValidator(req: express.Request): void {
        if (!req.body.id) {
            throw new Errors.BadRequestError("Document ID not present.");
        }

        if (!(typeof req.body.id === "number")) {
            throw new Errors.BadRequestError("Document ID was not a number.");
        }
    }
    public documentRepository = getManager().getRepository(Document);

    /* Get all documents that exist in the 'document' table under the
     * configured connection.
     */
    @GET
    public getDocuments(): Promise<any> {
        return this.documentRepository.find();
    }

    /* Get a specific document from 'document' table based on passed
     * document id.
     *
     * Fails if a document with the specified id is not found.
     */
    @Path("/:id")
    @GET
    public getDocument(@PathParam("id") id: number): Promise<any> {
        try {
            return this.documentRepository.findOneOrFail(id);
        } catch (EntityNotFoundError) {
            // TODO: Change to arrow function and update tslint.json config.
            return new Promise<Document>(function(resolve, reject) {
                reject(new EntityNotFoundError("Unable to find document with ${id}"));
            });
        }

    }

    /* Create a new entry in the 'document' table with the specified
     * information.
     */
    @POST
    @PreProcessor(DocumentService.createDocumentValidator)
    // TODO: Figure out how to allow Swagger to recognize these arguments.
    public async createDocument(document: Document): Promise<any> {
        // TODO: Catch more exceptions here.
        await this.documentRepository.save(document);
    }

    /* Update an entry in the 'document' table with the specified
     * information.
     */
    @PUT
    @PreProcessor(DocumentService.updateDocumentValidator)
    // TODO: Figure out how to allow Swagger to recognize these arguments.
    public async updateDocument(document: Document): Promise<any> {
        // TODO: Is there a better way to do this?
        let currDocument = null;

        try {
            currDocument = await this.documentRepository.findOneOrFail(document.id);
        } catch (EntityNotFoundError) {
            // TODO: Change to arrow function and update tslint.json config.
            return new Promise<Document>(function(resolve, reject) {
                reject(new EntityNotFoundError("Unable to find document with ${id}"));
            });
        }

        // Update current stored name if given one.
        if (document.name) {
            currDocument.name = document.name;
        }

        // Update current stored workflow if given one.
        if (document.workflow) {
            currDocument.workflow = document.workflow;
        }

        // TODO: Catch more exceptions here.
        await this.documentRepository.save(document);
    }
}
