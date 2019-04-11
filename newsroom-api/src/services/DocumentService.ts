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

        if (!req.body.creator) {
            throw new Errors.BadRequestError("Document creator not present.");
        }

        if (!(typeof req.body.creator === "string")) {
            throw new Errors.BadRequestError("Document creator was not a string.");
        }

        if (!req.body.workflow) {
            throw new Errors.BadRequestError("Document workflow not present.");
        }

        if (!(typeof req.body.workflow === "number")) {
            throw new Errors.BadRequestError("Document workflow was not a number.");
        }

        if (!req.body.stage) {
            throw new Errors.BadRequestError("Document stage not present.");
        }

        if (!(typeof req.body.stage === "number")) {
            throw new Errors.BadRequestError("Document stage was not a number.");
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

        if (req.body.name) {
            if (!(typeof req.body.name === "string")) {
                throw new Errors.BadRequestError("Document name was not a string.");
            }
        }

        if (req.body.creator) {
            if (!(typeof req.body.creator === "string")) {
                throw new Errors.BadRequestError("Document creator was not a string.");
            }
        }

        if (req.body.workflow) {
            if (!(typeof req.body.workflow === "number")) {
                throw new Errors.BadRequestError("Document workflow was not a number.");
            }
        }

        if (req.body.stage) {
            if (!(typeof req.body.stage === "number")) {
                throw new Errors.BadRequestError("Document stage was not a number.");
            }
        }
    }

    /* Used to interact with any given document in the database.
     */
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
     * Returns a 404 if the document is not found.
     */
    @Path("/:id")
    @GET
    public getDocument(@PathParam("id") id: number): Promise<any> {
        try {
            return this.documentRepository.findOneOrFail(id);
        } catch (EntityNotFoundError) {
            // TODO: Change to arrow function and update tslint.json config.
            return new Promise<Document>(function(resolve, reject) {
                reject({ status: 404 });
                // reject(new EntityNotFoundError("Unable to find document with ${id}"));
            });
        }
    }

    /* Create a new entry in the 'document' table with the specified
     * information.
     *
     * Returns a 404 if the parameters to create the document were not
     * sufficient.
     *      - Wrong types.
     */
    @POST
    // TODO: Make PreProcessor return a 404?
    @PreProcessor(DocumentService.createDocumentValidator)
    // TODO: Figure out how to allow Swagger to recognize these arguments.
    public async createDocument(document: Document): Promise<any> {
        // TODO: Catch more exceptions here.
        await this.documentRepository.save(document);
    }

    /* Update an entry in the 'document' table with the specified
     * information.
     *
     * Returns a 404 if the parameters to update the document were
     * not sufficient.
     *      - Missing ID.
     */
    @PUT
    @PreProcessor(DocumentService.updateDocumentValidator)
    // TODO: Figure out how to allow Swagger to recognize these arguments.
    public async updateDocument(document: Document): Promise<any> {
        // TODO: Is there a better way to do this?
        let currDocument: Document = null;

        try {
            currDocument = await this.documentRepository.findOneOrFail(document.id);
        } catch (EntityNotFoundError) {
            // TODO: Change to arrow function and update tslint.json config.
            return new Promise<Document>(function(resolve, reject) {
                reject({ status: 404 });
                // reject(new EntityNotFoundError("Unable to find document with ${id}"));
            });
        }

        // Update current stored name if given one.
        if (document.name) {
            currDocument.name = document.name;
        }

        // Update the creator of the document.
        if (document.creator) {
            currDocument.creator = document.creator;
        }

        // Update current stored workflow if given one.
        // TODO: Does this update the workflows list of documents too?
        if (document.workflow) {
            currDocument.workflow = document.workflow;
        }

        // Update the current stage that the document is in.
        if (document.stage) {
            currDocument.stage = document.stage;
        }

        // TODO: Catch more exceptions here.
        await this.documentRepository.save(currDocument);
    }
}
