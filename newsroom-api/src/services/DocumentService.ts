import * as express from "express";
import { NRDocument, NRWorkflow } from "orm";
import { getManager } from "typeorm";
import { Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

/**
 * Provides API services for documents.
 */
@Path("/documents")
@Tags("Documents")
export class DocumentService {
    /**
     * When creating a new document, we need to validate that it has all the
     * required information to define a document. The document id should always
     * be blank because it is an auto-generated column.
     */
    private static createDocumentValidator(req: express.Request) {
        const document = req.body as NRDocument;

        if (!req.body.name) {
            throw new Errors.BadRequestError("Document name not present.");
        }

        if (!(typeof document.name === "string")) {
            throw new Errors.BadRequestError("Document name was not a string.");
        }

        if (!document.creator) {
            throw new Errors.BadRequestError("Document creator not present.");
        }

        if (!(typeof document.creator === "string")) {
            throw new Errors.BadRequestError("Document creator was not a string.");
        }

        if (!document.workflow) {
            throw new Errors.BadRequestError("Document workflow not present.");
        }

        if (!(typeof document.workflow === "number")) {
            throw new Errors.BadRequestError("Document workflow was not a number.");
        }

        if (!document.stage) {
            throw new Errors.BadRequestError("Document stage not present.");
        }

        if (!(typeof document.stage === "number")) {
            throw new Errors.BadRequestError("Document stage was not a number.");
        }
    }

    /**
     * When updating a document, fields may be empty because only some need to be
     * updated.
     */
    private static updateDocumentValidator(req: express.Request): void {
        const document = req.body as NRDocument;

        if (document.name) {
            if (!(typeof document.name === "string")) {
                throw new Errors.BadRequestError("Document name was not a string.");
            }
        }

        if (document.creator) {
            if (!(typeof document.creator === "string")) {
                throw new Errors.BadRequestError("Document creator was not a string.");
            }
        }

        if (document.workflow) {
            if (!(typeof document.workflow === "number")) {
                throw new Errors.BadRequestError("Document workflow was not a number.");
            }
        }

        if (document.stage) {
            if (!(typeof document.stage === "number")) {
                throw new Errors.BadRequestError("Document stage was not a number.");
            }
        }
    }

    /**
     * Used to interact with any given document/workflow in the database.
     */
    private documentRepository = getManager().getRepository(NRDocument);
    private workflowRepository = getManager().getRepository(NRWorkflow);

    /**
     * Get all documents that exist in the 'document' table under the
     * configured connection.
     */
    @GET
    public getDocuments(): Promise<NRDocument[]> {
        return this.documentRepository.find();
    }

    /**
     * Create a new entry in the 'document' table with the specified
     * information.
     *
     * Returns a 400 if:
     *      - Document properties are the wrong types.
     *      - Document is missing properties.
     *      - Document workflow doesn't exist.
     */
    @POST
    @PreProcessor(DocumentService.createDocumentValidator)
    public async createDocument(document: NRDocument): Promise<NRDocument> {
        let assocWorkflow: NRWorkflow = null;

        // Ensure that the workflow exists.
        try {
            assocWorkflow = await this.workflowRepository.findOneOrFail(document.workflow);
        } catch (err) {
            console.error("Error getting document associated workflow for document:", err);
            throw new NotFoundError("A workflow with the given ID was not found.");
        }

        // TODO: Catch more exceptions here.
        return await this.documentRepository.save(document);
    }

    /**
     * Get a specific document from 'document' table based on passed
     * document id.
     *
     * Returns a 404 if:
     *      - Document not found.
     */
    @Path("/:id")
    @GET
    public async getDocument(@PathParam("id") id: number): Promise<NRDocument> {
        try {
            return await this.documentRepository.findOneOrFail(id);
        } catch (err) {
            console.error("Error getting document:", err);
            throw new NotFoundError("A document with the given id was not found.");
        }
    }

    /**
     * Update an entry in the 'document' table with the specified
     * information.
     *
     * Returns a 400 if the parameters to update the document were
     * not sufficient.
     *      - Missing ID.
     */
    @PUT
    @Path("/:id")
    @PreProcessor(DocumentService.updateDocumentValidator)
    public async updateDocument(@IsInt @PathParam("id") id: number, document: NRDocument): Promise<NRDocument> {
        let currDocument: NRDocument;
        try {
            currDocument = await this.documentRepository.findOneOrFail(document.id);
        } catch (err) {
            console.error("Error getting document:", err);
            throw new NotFoundError("A document with the given id could not be found");
        }

        if (document.name) {
            currDocument.name = document.name;
        }

        if (document.creator) {
            currDocument.creator = document.creator;
        }

        // TODO: Does this update the workflows list of documents too?
        if (document.workflow) {
            currDocument.workflow = document.workflow;
        }

        // TODO Should we allow changing the documents stage in this manner? Or only through /prev/next
        if (document.stage) {
            currDocument.stage = document.stage;
        }

        return await this.documentRepository.save(currDocument);
    }
}
