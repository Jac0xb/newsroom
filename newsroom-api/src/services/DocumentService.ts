import * as express from "express";
import { NRDocument, NRStage, NRWorkflow } from "orm";
import { getManager } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

/**
 * Provides API services for documents.
 */
@Path("/api/documents")
@Tags("Documents")
export class DocumentService {

    /**
     * When creating a new document, we need to validate that it has all the
     * required information to define a document. The document id should always
     * be blank because it is an auto-generated column.
     */
    private static createDocumentValidator(req: express.Request) {
        const document = req.body as NRDocument;

        if (!document.name) {
            throw new Errors.BadRequestError("Document name not present.");
        }

        if (!(typeof document.name === "string")) {
            throw new Errors.BadRequestError("Document name was not a string.");
        }

        if (document.name.length > 256) {
            throw new Errors.BadRequestError("Document name length is too long, max 256.");
        }

        if (!document.creator) {
            throw new Errors.BadRequestError("Document creator not present.");
        }

        if (!(typeof document.creator === "string")) {
            throw new Errors.BadRequestError("Document creator was not a string.");
        }

        if (document.creator.length > 256) {
            throw new Errors.BadRequestError("Document creator length is too long, max 256.");
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

        if (document.description) {
            if (!(typeof document.description === "string")) {
                throw new Errors.BadRequestError("Document description was not a string.");
            }

            if (document.description.length > 1000) {
                throw new Errors.BadRequestError("Document description too long, max 1000.");
            }
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

            if (document.name.length > 256) {
                throw new Errors.BadRequestError("Document name length is too long, max 256.");
            }
        }

        if (document.creator) {
            if (!(typeof document.creator === "string")) {
                throw new Errors.BadRequestError("Document creator was not a string.");
            }

            if (document.creator.length > 256) {
                throw new Errors.BadRequestError("Document creator length is too long, max 256.");
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

        if (document.content) {
            if (!(typeof document.content === "string")) {
                throw new Errors.BadRequestError("Document content was not a string.");
            }
        }

        if (document.description) {
            if (!(typeof document.description === "string")) {
                throw new Errors.BadRequestError("Document description was not a string.");
            }

            if (document.description.length > 1000) {
                throw new Errors.BadRequestError("Document description length is too long, max 1000.");
            }
        }
    }
    public stageRepository = getManager().getRepository(NRStage);
    /**
     * Used to interact with any given document/workflow in the database.
     */
    private documentRepository = getManager().getRepository(NRDocument);
    private workflowRepository = getManager().getRepository(NRWorkflow);

    /**
     * Create a new entry in the 'document' table with the specified
     * information.
     *
     * Returns a 400 if:
     *      - Workflow id not found.
     *      - Stage id not found.
     *
     * Returns 404 if:
     *      - Bad parameters.
     */
    @POST
    @PreProcessor(DocumentService.createDocumentValidator)
    public async createDocument(document: NRDocument): Promise<NRDocument> {
        try {
            await this.workflowRepository.findOneOrFail(document.workflow);
        } catch (err) {
            console.error("Error getting Document associated Workflow:", err);
            throw new NotFoundError("A Workflow with the given ID was not found.");
        }

        try {
            await this.stageRepository.findOneOrFail(document.stage);
        } catch (err) {
            console.error("Error getting Stage for Document:", err);
            throw new NotFoundError("A Stage for the Document could not be found.");
        }

        return await this.documentRepository.save(document);
    }

    /**
     * Get all documents that exist in the 'document' table under the
     * configured connection.
     */
    @GET
    public getDocuments(): Promise<NRDocument[]> {
        return this.documentRepository.find();
    }

    /**
     * Get a specific document from 'document' table based on passed
     * document id.
     *
     * Returns a 400 if:
     *      - Document id not found.
     */
    @Path("/:id")
    @GET
    public async getDocument(@PathParam("id") id: number): Promise<NRDocument> {
        try {
            return await this.documentRepository.findOneOrFail(id);
        } catch (err) {
            console.error("Error getting Document:", err);
            throw new NotFoundError("A Document with the given ID was not found.");
        }
    }

    /**
     * Get all documents for a specific author.
     *
     * Returns a 400 if:
     *      - Document id not found.
     */
    @Path("/author/:name")
    @GET
    public async getDocumentsForAuthor(@PathParam("name") authorName: string): Promise<NRDocument[]> {
        return await this.documentRepository
            .createQueryBuilder("document")
            .where("document.creator = :cn", { cn: authorName })
            .getMany();
    }

    /**
     * Get all documents for the stage based on passed stage id.
     *
     * Returns a 400 if:
     *      - Document id not found.
     *      - Stage id not found.
     */
    @Path("/stage/:sid")
    @GET
    public async getAllDocumentsForStage(@IsInt @PathParam("sid") sid: number): Promise<NRDocument[]> {
        let assocStage: NRStage;

        try {
            assocStage = await this.stageRepository.findOneOrFail(sid);
        } catch (err) {
            console.error("Error getting Stage for Document:", err);
            throw new NotFoundError("A Stage for the Document could not be found.");
        }

        return await this.documentRepository
            .createQueryBuilder("document")
            .where("stageId = :sId", { sId: assocStage.id })
            .getMany();
    }

    /**
     * Get all documents for the workflow based on passed workflow id.
     *
     * Returns a 400 if:
     *      - Document id not found.
     *      - Workflow id not found.
     */
    @Path("/workflow/:wid")
    @GET
    public async getAllDocumentsForWorkflow(@IsInt @PathParam("wid") wid: number): Promise<NRDocument[]> {
        try {
            await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting Workflow for Document:", err);
            throw new NotFoundError("A Workflow for the Document could not be found.");
        }

        const allDocs = await this.documentRepository
            .createQueryBuilder("document")
            .where("workflowId = :wId", { wId: wid })
            .getMany();

        return allDocs;
    }

    /**
     * Update an entry in the 'document' table with the specified
     * information.
     *
     * Returns 400 if:
     *      - Workflow id not found.
     *      - Stage id not found.
     *      - Document id not fount.
     *
     * Returns 404 if:
     *      - Bad parameters.
     */
    @PUT
    @Path("/:id")
    @PreProcessor(DocumentService.updateDocumentValidator)
    public async updateDocument(@IsInt @PathParam("id") id: number, document: NRDocument): Promise<NRDocument> {
        let currDocument: NRDocument;

        try {
            currDocument = await this.documentRepository.findOneOrFail(document.id);
        } catch (err) {
            console.error("Error getting Document:", err);
            throw new NotFoundError("A Document with the given ID could not be found");
        }

        try {
            await this.workflowRepository.findOneOrFail(document.workflow);
        } catch (err) {
            console.error("Error getting Workflow for Document:", err);
            throw new NotFoundError("A Workflow for the Document could not be found.");
        }

        try {
            await this.stageRepository.findOneOrFail(document.stage);
        } catch (err) {
            console.error("Error getting Stage for Document:", err);
            throw new NotFoundError("A Stage for the Document could not be found.");
        }

        if (document.name) {
            currDocument.name = document.name;
        }

        if (document.creator) {
            currDocument.creator = document.creator;
        }

        if (document.description) {
            currDocument.description = document.description;
        }

        if (document.workflow) {
            currDocument.workflow = document.workflow;
        }

        if (document.stage) {
            currDocument.stage = document.stage;
        }

        if (document.content) {
            currDocument.content = document.content;
        }

        return await this.documentRepository.save(currDocument);
    }

    /**
     * Delete a document.
     *
     * Returns 404 if:
     *      - Document id not found.
     */
    @DELETE
    @Path("/:id")
    public async deleteDocument(@IsInt @PathParam("id") docId: number) {
        let currDocument: NRDocument;

        try {
            currDocument = await this.documentRepository.findOneOrFail(docId);
        } catch (err) {
            console.error("Error getting Document:", err);
            throw new NotFoundError("A Document with the given ID was not found.");
        }

        await this.documentRepository
            .createQueryBuilder("document")
            .delete()
            .from(NRDocument)
            .andWhere("id = :dId", { dId: currDocument.id })
            .execute();
    }

    /**
     * Get the next stage for a document.
     *
     * Returns 404 if:
     *      - Document id not found.
     *      - Next stage not found.
     */
    @GET
    @Path("/:id/next")
    public async getNext(@IsInt @PathParam("id") docId: number): Promise<number> {
        let currDocument: NRDocument;
        let currStage: NRStage;

        try {
            currDocument = await this.documentRepository.findOneOrFail(docId);
        } catch (err) {
            console.error("Error getting Document:", err);
            throw new NotFoundError("A Document with the given ID could not be found");
        }

        // TODO: How to do this with TypeORM?
        const stageID = await this.documentRepository
            .createQueryBuilder("document")
            .select("document.stageId", "val")
            .where("document.id = :did", { did: currDocument.id })
            .getRawOne();

        try {
            currStage = await this.stageRepository.findOneOrFail(stageID.val);
        } catch (err) {
            console.error("Error getting Stage for Document:", err);
            throw new NotFoundError("A Stage for the Document could not be found.");
        }

        // TODO: Better way to do this with TypeORM?
        //       currDocument.workflow.id doesn't work -> load relations?
        const workflowId = await this.documentRepository
            .createQueryBuilder("document")
            .select("document.workflowId", "val")
            .where("document.id = :did", { did: currDocument.id })
            .getRawOne();

        // Used to determine if the document is done in its workflow.
        const maxSeq = await this.getMaxStageSequenceId(workflowId.val);

        // The document can be moved forward.
        if ((currStage.sequenceId + 1) <= maxSeq) {
            // Get id of next stage in sequence.
            const nextId = await this.stageRepository
                .createQueryBuilder("stage")
                .select("stage.id", "val")
                .where("stage.sequenceId = :sid", { sid: currStage.sequenceId + 1 })
                .andWhere("stage.workflowId = :wid", { wid: workflowId.val })
                .getRawOne();

            return nextId.val;
        }

        return maxSeq;
    }

    /**
     * Move a document to the next stage.
     *
     * Returns 404 if:
     *      - Document id not found.
     *      - Associated stage not found.
     */
    @PUT
    @Path("/:id/next")
    public async moveNext(@IsInt @PathParam("id") docId: number): Promise<NRDocument> {
        let currDocument: NRDocument;
        let currStage: NRStage;

        try {
            currDocument = await this.documentRepository.findOneOrFail(docId);
        } catch (err) {
            console.error("Error getting Document:", err);
            throw new NotFoundError("A Document with the given ID could not be found");
        }

        // TODO: How to do this with TypeORM?
        const stageID = await this.documentRepository
            .createQueryBuilder("document")
            .select("document.stageId", "val")
            .where("document.id = :did", { did: currDocument.id })
            .getRawOne();

        try {
            currStage = await this.stageRepository.findOneOrFail(stageID.val);
        } catch (err) {
            console.error("Error getting Stage for Document:", err);
            throw new NotFoundError("A Stage for the Document could not be found.");
        }

        // TODO: Better way to do this with TypeORM?
        //       currDocument.workflow.id doesn't work -> load relations?
        const workflowId = await this.documentRepository
            .createQueryBuilder("document")
            .select("document.workflowId", "val")
            .where("document.id = :did", { did: currDocument.id })
            .getRawOne();

        // Used to determine if the document is done in its workflow.
        const maxSeq = await this.getMaxStageSequenceId(workflowId.val);

        // The document can be moved forward.
        if ((currStage.sequenceId + 1) <= maxSeq) {
            // Get id of next stage in sequence.
            const nextId = await this.stageRepository
                .createQueryBuilder("stage")
                .select("stage.id", "val")
                .where("stage.sequenceId = :sid", { sid: currStage.sequenceId + 1 })
                .andWhere("stage.workflowId = :wid", { wid: workflowId.val })
                .getRawOne();

            currDocument.stage = nextId.val;
        }

        // It is possible that no updates were made if document is already at the
        // end of its workflows stages.
        // TODO: Relations not loaded, doesn't return stage if at the end.
        return await this.documentRepository.save(currDocument);
    }

    /**
     * Move a document to the next stage.
     *
     * Returns 404 if:
     *      - Document id not found.
     *      - Associated stage not found.
     */
    @GET
    @Path("/:id/prev")
    public async getPrev(@IsInt @PathParam("id") docId: number): Promise<number> {
        let currDocument: NRDocument;
        let currStage: NRStage;

        try {
            currDocument = await this.documentRepository.findOneOrFail(docId);
        } catch (err) {
            console.error("Error getting Document:", err);
            throw new NotFoundError("A Document with the given ID could not be found");
        }

        // TODO: How to do this with TypeORM?
        const stageID = await this.documentRepository
            .createQueryBuilder("document")
            .select("document.stageId", "val")
            .where("document.id = :did", { did: currDocument.id })
            .getRawOne();

        try {
            currStage = await this.stageRepository.findOneOrFail(stageID.val);
        } catch (err) {
            console.error("Error getting Stage for Document:", err);
            throw new NotFoundError("A Stage for the Document could not be found.");
        }

        // TODO: Better way to do this with TypeORM?
        //       currDocument.workflow.id doesn't work -> load relations?
        const workflowId = await this.documentRepository
            .createQueryBuilder("document")
            .select("document.workflowId", "val")
            .where("document.id = :did", { did: currDocument.id })
            .getRawOne();

        // The first stage in any workflow is always sequence 1.
        const minSeq = 1;

        // The document can be moved forward.
        if ((currStage.sequenceId - 1) >= minSeq) {
            // Get id of next stage in sequence.
            const prevId = await this.stageRepository
                .createQueryBuilder("stage")
                .select("stage.id", "val")
                .where("stage.sequenceId = :sid", { sid: currStage.sequenceId - 1 })
                .andWhere("stage.workflowId = :wid", { wid: workflowId.val })
                .getRawOne();

            return prevId.val;
        }

        return minSeq;
    }

    /**
     * Move a document to the next stage.
     *
     * Returns 404 if:
     *      - Document id not found.
     *      - Associated stage not found.
     */
    @PUT
    @Path("/:id/prev")
    public async movePrev(@IsInt @PathParam("id") docId: number): Promise<NRDocument> {
        let currDocument: NRDocument;
        let currStage: NRStage;

        try {
            currDocument = await this.documentRepository.findOneOrFail(docId);
        } catch (err) {
            console.error("Error getting Document:", err);
            throw new NotFoundError("A Document with the given ID could not be found");
        }

        const stageID = await this.documentRepository
            .createQueryBuilder("document")
            .select("document.stageId", "val")
            .where("document.id = :did", { did: currDocument.id })
            .getRawOne();

        try {
            currStage = await this.stageRepository.findOneOrFail(stageID.val);
        } catch (err) {
            console.error("Error getting Stage for Document:", err);
            throw new NotFoundError("A Stage for the Document could not be found.");
        }

        // TODO: Better way to do this with TypeORM?
        //       currDocument.workflow.id doesn't work -> load relations?
        const workflowId = await this.documentRepository
            .createQueryBuilder("document")
            .select("document.workflowId", "val")
            .where("document.id = :did", { did: currDocument.id })
            .getRawOne();

        // The first stage in any workflow is always sequence 1.
        const minSeq = 1;

        // The document can be moved forward.
        if ((currStage.sequenceId - 1) >= minSeq) {
            // Get id of next stage in sequence.
            const prevId = await this.stageRepository
                .createQueryBuilder("stage")
                .select("stage.id", "val")
                .where("stage.sequenceId = :sid", { sid: currStage.sequenceId - 1 })
                .andWhere("stage.workflowId = :wid", { wid: workflowId.val })
                .getRawOne();

            currDocument.stage = prevId.val;
        }

        // It is possible that no updates were made if document is already at the
        // end of its workflows stages.
        // TODO: Relations not loaded, doesn't return stage if at the beginning.
        return await this.documentRepository.save(currDocument);
    }

    /**
     * Get the maximum sequenceId for the given workflows stages.
     */
    private async getMaxStageSequenceId(workflowId: number): Promise<number> {
        let currWorkflow: NRWorkflow;

        try {
            currWorkflow = await this.workflowRepository.findOneOrFail(workflowId);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        // Grab the next sequenceId for this set of workflow stages.
        const maxSeq = await this.stageRepository
            .createQueryBuilder("stage")
            .select("MAX(stage.sequenceId)", "max")
            .where("stage.workflowId = :id", { id: currWorkflow.id })
            .getRawOne();

        return maxSeq.max;
    }
}
