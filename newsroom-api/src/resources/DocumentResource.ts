import { Repository } from "typeorm";
import { DELETE, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";

import { Inject } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRDCPermission, NRDocument, NRStage, NRSTPermission, NRWorkflow } from "../entity";
import { DBConstants } from "../services/DBConstants";
import { DocumentService } from "../services/DocumentService";
import { PermissionService } from "../services/PermissionService";
import { UserService } from "../services/UserService";
import { validators } from "../services/Validators";
import { WorkflowService } from "../services/WorkflowService";

// Provides API services for documents.
@Path("/api/documents")
@Tags("Documents")
export class DocumentResource {
    @InjectRepository(NRStage)
    private stageRepository: Repository<NRStage>;

    @InjectRepository(NRWorkflow)
    private workflowRepository: Repository<NRWorkflow>;

    @InjectRepository(NRDocument)
    private documentRepository: Repository<NRDocument>;

    @InjectRepository(NRSTPermission)
    private permSTRepository: Repository<NRSTPermission>;

    @InjectRepository(NRDCPermission)
    private permDCRepository: Repository<NRDCPermission>;

    @Inject()
    private workflowService: WorkflowService;

    @Inject()
    private documentService: DocumentService;

    @Inject()
    private permissionService: PermissionService;

    @Inject()
    private userService: UserService;

    /**
     * Create a new document based on passed information.
     *
     * Returns:
     *      - NRDocument
     *      - BadRequestError(400)
     *          - If document properties missing.
     *          - If document properties are wrong.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to create documents.
     */
    @POST
    @PreProcessor(validators.createDocumentValidator)
    public async createDocument(document: NRDocument): Promise<NRDocument> {
        const currWorkflow = await this.workflowService.getWorkflow(document.workflow.id);

        // Assign the document to the first stage in a workflow if no stage was passed.
        if (!(document.stage)) {
            const minSeq = await this.getMinStageSequenceId(currWorkflow.id);
            let currStage: NRStage;

            currStage = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .where("stage.sequenceId = :sid", {sid: minSeq})
                .andWhere("stage.workflowId = :wid ", {wid: currWorkflow.id})
                .getOne();

            document.stage = currStage;
        }

        return await this.documentRepository.save(document);
    }

    /**
     * Get all existing documents.
     *
     * Returns:
     *      - NRDocument[]
     */
    @GET
    public async getDocuments(): Promise<NRDocument[]> {
        return await this.documentRepository.find();
    }

    /**
     * Get a specific document by ID.
     *
     * Returns:
     *      - NRDocument
     *      - NotFoundError (404)
     *          - If document not found.
     */
    @Path("/:did")
    @GET
    public async getDocument(@PathParam("did") did: number): Promise<NRDocument> {
        return await this.documentService.getDocument(did);
    }

    /**
     * Get all documents for a specific author.
     *
     * Returns:
     *      - NRDocument[]
     */
    @Path("/author/:aid")
    @GET
    public async getDocumentsForAuthor(@PathParam("aid") aid: number): Promise<NRDocument[]> {
        return await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .where("document.creator = :author", {author: aid})
            .getMany();
    }

    /**
     * Get all documents for a given stage.
     *
     * Returns:
     *      - NRDocument[]
     *      - NotFoundError (404)
     *          - If stage not found.
     */
    @Path("/stage/:sid")
    @GET
    public async getAllDocumentsForStage(@IsInt @PathParam("sid") sid: number): Promise<NRDocument[]> {
        const assocStage = await this.workflowService.getStage(sid);

        return await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .where("stageId = :sId", {sId: assocStage.id})
            .getMany();
    }

    /**
     * Get all documents for a given workflow.
     *
     * Returns:
     *      - NRDocument[]
     *      - NotFoundError (404)
     *          - If workflow not found.
     *
     */
    @Path("/workflow/:wid")
    @GET
    public async getAllDocumentsForWorkflow(@IsInt @PathParam("wid") wid: number): Promise<NRDocument[]> {
        // Check for existence.
        await this.workflowService.getWorkflow(wid);

        const allDocs = await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .where("workflowId = :id", {id: wid})
            .getMany();

        return allDocs;
    }

    /**
     * Update a document based on passed information.
     *
     * Returns:
     *      - NRDocument
     *      - BadRequestError (400)
     *          - If bad form submission.
     *      - NotFoundError (404)
     *          - If document not found.
     *          - If stage not found.
     *          - If workflow not found.
     */
    @PUT
    @Path("/:did")
    @PreProcessor(validators.updateDocumentValidator)
    public async updateDocument(@IsInt @PathParam("did") did: number,
                                document: NRDocument): Promise<NRDocument> {
        const sessionUser = this.userService.getUserFromContext();
        const currDocument = await this.documentService.getDocument(did);
        await this.permissionService.checkDCWritePermissions(sessionUser, did);

        // Check for existence.
        await this.workflowService.getWorkflow(document.workflow.id);
        await this.workflowService.getStage(document.stage.id);

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
     * Returns
     *      - NotFoundError (404)
     *          - If document not found.
     */
    @DELETE
    @Path("/:did")
    public async deleteDocument(@IsInt @PathParam("did") did: number) {
        const sessionUser = this.userService.getUserFromContext();
        const currDocument = await this.documentService.getDocument(did);
        await this.permissionService.checkDCWritePermissions(sessionUser, did);

        await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .delete()
            .from(NRDocument)
            .andWhere("id = :id", {id: currDocument.id})
            .execute();
    }

    /**
     * Get the next stage for a document.
     *
     * Returns:
     *      - Number
     *      - NotFoundError (404)
     *          - If document not found.
     */
    @GET
    @Path("/:did/next")
    public async getNext(@IsInt @PathParam("did") did: number): Promise<number> {
        const currDocument = await this.documentService.getDocument(did);

        const stageID = await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .select("document.stageId", "val")
            .where("document.id = :did", {did: currDocument.id})
            .getRawOne();

        const currStage = await this.workflowService.getStage(stageID.val);

        const workflowID = await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .select("document.workflowId", "val")
            .where("document.id = :did", {did: currDocument.id})
            .getRawOne();

        // Used to determine if the document is done in its workflow.
        const maxSeq = await this.getMaxStageSequenceId(workflowID.val);

        // The document can be moved forward.
        if ((currStage.sequenceId + 1) <= maxSeq) {
            // Get id of next stage in sequence.
            const nextId = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .select("stage.id", "val")
                .where("stage.sequenceId = :sid", {sid: currStage.sequenceId + 1})
                .andWhere("stage.workflowId = :wid", {wid: workflowID.val})
                .getRawOne();

            return nextId.val;
        }

        return maxSeq;
    }

    /**
     * Move a document to the next stage.
     *
     * Returns:
     *      - NRDocument
     *      - Forbidden Error (403)
     *          - If user isn't authorized to move stage.
     *      - NotFoundError (404)
     *          - If document not found.
     */
    @PUT
    @Path("/:did/next")
    public async moveNext(@IsInt @PathParam("did") did: number): Promise<NRDocument> {
        const sessionUser = this.userService.getUserFromContext();
        const currDocument = await this.documentService.getDocument(did);
        const currStage = currDocument.stage;
        const workflowId = currDocument.workflow.id;

        // Must have WRITE on current stage to move forward.
        await this.permissionService.checkDCWritePermissions(sessionUser, did);

        // Used to determine if the document is done in its workflow.
        const maxSeq = await this.getMaxStageSequenceId(workflowId);

        // The document can be moved forward.
        if ((currStage.sequenceId + 1) <= maxSeq) {
            // Get id of next stage in sequence.
            const nextStage = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .where("stage.sequenceId = :sid", {sid: currStage.sequenceId + 1})
                .andWhere("stage.workflowId = :wid", {wid: workflowId})
                .getOne();

            currDocument.stage = nextStage;
        }

        // It is possible that no updates were made if document is already at the
        // end of its workflows stages.
        // TODO: Relations not loaded, doesn't return stage if at the end.
        return await this.documentRepository.save(currDocument);
    }

    /**
     * Move a document to the next stage.
     *
     * Returns:
     *      - Number
     *      - NotFoundError (404)
     *          - If document not found.
     *          - If associated stage not found.
     */
    @GET
    @Path("/:did/prev")
    public async getPrev(@IsInt @PathParam("did") did: number): Promise<number> {
        const currDocument = await this.documentService.getDocument(did);

        // TODO: How to do this with TypeORM?
        const stageID = await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .select("document.stageId", "val")
            .where("document.id = :did", {did: currDocument.id})
            .getRawOne();

        const currStage = await this.workflowService.getStage(stageID.val);

        const workflowID = await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .select("document.workflowId", "val")
            .where("document.id = :did", {did: currDocument.id})
            .getRawOne();

        // The first stage in any workflow is always sequence 1.
        const minSeq = 0;

        // The document can be moved forward.
        if ((currStage.sequenceId - 1) >= minSeq) {
            // Get id of next stage in sequence.
            const prevId = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .select("stage.id", "val")
                .where("stage.sequenceId = :sid", {sid: currStage.sequenceId - 1})
                .andWhere("stage.workflowId = :wid", {wid: workflowID.val})
                .getRawOne();

            return prevId.val;
        }

        return minSeq;
    }

    /**
     * Move a document to the next stage.
     *
     * Returns:
     *      - NRDocument
     *      - ForbiddenErrr (403)
     *          - If user isn't authorized to move stage.
     *      - NotFoundError (404)
     *          - If document not found.
     *          - If associated stage not found.
     */
    @PUT
    @Path("/:did/prev")
    public async movePrev(@IsInt @PathParam("did") did: number): Promise<NRDocument> {
        const sessionUser = this.userService.getUserFromContext();
        const currDocument = await this.documentService.getDocument(did);
        const currStage = currDocument.stage;
        const workflowId = currDocument.workflow.id;

        // The first stage in any workflow is always sequence 1.
        const minSeq = 0;

        // The document can be moved forward.
        if ((currStage.sequenceId - 1) >= minSeq) {
            // Get id of next stage in sequence.
            const prevStage = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .where("stage.sequenceId = :sid", {sid: currStage.sequenceId - 1})
                .andWhere("stage.workflowId = :wid", {wid: workflowId})
                .getOne();

            // Must have WRITE on previous stage to move backward.
            await this.permissionService.checkDCWritePermissions(sessionUser, did);
            currDocument.stage = prevStage;
        }

        // It is possible that no updates were made if document is already at the
        // end of its workflows stages.
        // TODO: Relations not loaded, doesn't return stage if at the beginning.
        return await this.documentRepository.save(currDocument);
    }

    // Get the maximum sequenceId for the given workflows stages.
    private async getMaxStageSequenceId(wid: number): Promise<number> {
        const currWorkflow = await this.workflowService.getWorkflow(wid);

        // Grab the next sequenceId for this set of workflow stages.
        const maxSeq = await this.stageRepository
            .createQueryBuilder(DBConstants.STGE_TABLE)
            .select("MAX(stage.sequenceId)", "max")
            .where("stage.workflowId = :id", {id: currWorkflow.id})
            .getRawOne();

        return maxSeq.max;
    }

    // Get the minimum sequenceId for the given workflows stages.
    private async getMinStageSequenceId(wid: number): Promise<number> {
        const currWorkflow = await this.workflowService.getWorkflow(wid);

        // Grab the next sequenceId for this set of workflow stages.
        const minSeq = await this.stageRepository
            .createQueryBuilder(DBConstants.STGE_TABLE)
            .select("MIN(stage.sequenceId)", "min")
            .where("stage.workflowId = :id", {id: currWorkflow.id})
            .getRawOne();

        return minSeq.min;
    }
}
