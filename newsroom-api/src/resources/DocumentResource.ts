import { Inject } from "typedi";
import { In, IsNull, Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context, DELETE, GET, Path, PathParam, POST,
         PreProcessor, PUT, ServiceContext } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { BadRequestError, ForbiddenError } from "typescript-rest/dist/server/model/errors";
import { DBConstants, NRDCPermission, NRDocument, NRStage, NRSTPermission,
         NRSTUSPermission, NRWFUSPermission, NRWorkflow } from "../entity";
import { DocumentService } from "../services/DocumentService";
import { PermissionService } from "../services/PermissionService";
import { NotificationService } from "../services/triggers/NotificationService";
import { UserService } from "../services/UserService";
import { WorkflowService } from "../services/WorkflowService";
import { createDocumentValidator, updateDocumentValidator } from "../validators/DocumentValidators";

// Provides API services for documents.
@Path("/api/documents")
@Tags("Documents")
export class DocumentResource {
    @Context
    private serviceContext: ServiceContext;

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

    @InjectRepository(NRWFUSPermission)
    private wfUSRepository: Repository<NRWFUSPermission>;

    @InjectRepository(NRSTUSPermission)
    private stUSRepository: Repository<NRSTUSPermission>;

    @Inject()
    private workflowService: WorkflowService;

    @Inject()
    private documentService: DocumentService;

    @Inject()
    private permissionService: PermissionService;

    @Inject()
    private userService: UserService;

    @Inject()
    private notificationService: NotificationService;

    /**
     * Create a new document based on passed information.
     *
     * response:
     *      - NRDocument
     *      - BadRequestError(400)
     *          - If document properties missing.
     *          - If document properties are wrong.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to create documents.
     */
    @POST
    @PreProcessor(createDocumentValidator)
    public async createDocument(document: NRDocument): Promise<NRDocument> {
        const user = this.serviceContext.user();
        const wf = await this.workflowService.getWorkflow(document.workflow.id);

        // Assign the document to the first stage in a workflow if no stage was passed.
        if (!(document.stage)) {
            const minSeq = await this.getMinStageSequenceId(wf.id);

            if (minSeq === -1) {
                const errStr = `Can't create a document in workflow ${wf.id} with no stages.`;

                console.log(errStr);
                throw new BadRequestError(errStr);
            }

            document.stage = await this.stageRepository.findOne({ where: { workflow: wf, sequenceId: minSeq } });
        } else {
            // Verify that the specified stage actually exists.
            await this.workflowService.getStage(document.stage.id);
        }

        // Check permissions to stage.
        await this.permissionService.checkSTWritePermissions(user, document.stage);

        document.creator = user;
        document.googleDocId = await this.documentService.createGoogleDocument(user, document);

        const newDocument = await this.documentRepository.save(document);

        this.notificationService.sendDocumentCreatedOnWorkflowNotifications(newDocument, currWorkflow);

        return newDocument;
    }

    /**
     * Get all existing documents.
     *
     * response:
     *      - NRDocument[]
     */
    @GET
    public async getDocuments(): Promise<NRDocument[]> {
        return await this.documentRepository.find();
    }

    /**
     * Get all documents a user has write permissions on.
     *
     * response:
     *      - NRDocument[]
     */
    @GET
    @Path("/user")
    public async getUserDocuments(): Promise<NRDocument[]> {
        const usr = this.serviceContext.user();
        const docs = new Set<NRDocument>();

        // Individual permissions.
        const allPerms = await this.stUSRepository.find({ relations: ["stage"],
                                                          where: { access: DBConstants.WRITE,
                                                                   userId: usr.id } } );

        for (const perm of allPerms) {
            const st = await this.stageRepository.findOne(perm.stage.id, { relations: ["documents"] });

            for (const doc of st.documents) {
                docs.add(doc);
            }
        }

        // Group permissions..
        const allRoles = await this.userService.getUserRoles(usr.id);
        for (const role of allRoles) {
            const stp = await this.permSTRepository.find({ relations: ["stage"],
                                                           where: { access: DBConstants.WRITE,
                                                                    role } });

            for (const st of stp) {
                docs.add(await this.documentRepository.findOne({ where: { stage: st.stage }}));
            }
        }

        return Array.from(docs.values());
    }

    /**
     * Get a specific document by ID.
     *
     * Returns:
     *      - NRDocument
     *      - NotFoundError (404)
     *          - If document not found.
     */
    @GET
    @Path("/:did")
    public async getDocument(@PathParam("did") did: number): Promise<NRDocument> {
        return await this.documentService.getDocument(did);
    }

    /**
     * Get all documents for a specific author.
     *
     * Returns:
     *      - NRDocument[]
     */
    @GET
    @Path("/author/:aid")
    public async getDocumentsForAuthor(@PathParam("aid") aid: number): Promise<NRDocument[]> {
        return await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .where(`${DBConstants.DOCU_TABLE}.creator = :author`, {author: aid})
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
    @GET
    @Path("/stage/:sid")
    public async getAllDocumentsForStage(@IsInt @PathParam("sid") sid: number): Promise<NRDocument[]> {
        await this.workflowService.getStage(sid);

        return await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .where("stageId = :sId", {sId: sid})
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
    @GET
    @Path("/workflow/:wid")
    public async getAllDocumentsForWorkflow(@IsInt @PathParam("wid") wid: number): Promise<NRDocument[]> {
        // Check for existence.
        await this.workflowService.getWorkflow(wid);

        return await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .where("workflowId = :id", {id: wid})
            .getMany();
    }

    /**
     * Get all documents that aren't in a workflow or stage.
     *
     * Returns:
     *      - NRDocument[]
     *      - NotFoundError (404)
     *          - If workflow not found.
     *
     */
    @GET
    @Path("/orphan")
    public async getAllOrphanDocuments(): Promise<NRDocument[]> {
        return await this.documentRepository.find( { where: [ { workflow: IsNull() },
                                                              { stage: IsNull() } ] });
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
    @PreProcessor(updateDocumentValidator)
    public async updateDocument(@IsInt @PathParam("did") did: number,
                                document: NRDocument): Promise<NRDocument> {
        const sessionUser = this.serviceContext.user();
        const currDocument = await this.documentService.getDocument(did);

        if (document.name) {
            currDocument.name = document.name;

            await this.documentService.updateGoogleDocumentTitle(sessionUser, currDocument);
        }

        if (document.description) {
            currDocument.description = document.description;
        }

        if (document.workflow) {
            await this.workflowService.getWorkflow(document.workflow.id);

            currDocument.workflow = document.workflow;
        }

        if (document.stage) {
            await this.workflowService.getStage(document.stage.id);

            currDocument.stage = document.stage;
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
        console.log(`DocumentResource.deleteDocument, action=try to delete document, document_id=${did}`);
        const currDocument = await this.documentService.getDocument(did);
        console.log(`DocumentResource.deleteDocument, action=got document, document_id=${currDocument.id}`);

        // await this.documentService.deleteGoogleDocument(sessionUser, currDocument.googleDocId);

        await this.documentRepository.remove(currDocument);
        console.log(`DocumentResource.deleteDocument, action=deleted document`);
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
            .select(`${DBConstants.DOCU_TABLE}.stageId`, "val")
            .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: currDocument.id})
            .getRawOne();

        const currStage = await this.workflowService.getStage(stageID.val);

        const workflowID = await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .select(`${DBConstants.DOCU_TABLE}.workflowId`, "val")
            .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: currDocument.id})
            .getRawOne();

        // Used to determine if the document is done in its workflow.
        const maxSeq = await this.getMaxStageSequenceId(workflowID.val);

        // The document can be moved forward.
        if ((currStage.sequenceId + 1) <= maxSeq) {
            // Get id of next stage in sequence.
            const nextId = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .select(`${DBConstants.STGE_TABLE}.id`, "val")
                .where(`${DBConstants.STGE_TABLE}.sequenceId = :sid`, {sid: currStage.sequenceId + 1})
                .andWhere(`${DBConstants.STGE_TABLE}.workflowId = :wid`, {wid: workflowID.val})
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
        const sessionUser = this.serviceContext.user();
        const currDocument = await this.documentService.getDocument(did);
        const currStage = currDocument.stage;
        const workflowId = currDocument.workflow.id;

        // Must have WRITE on current stage to move forward.
        await this.permissionService.checkSTWritePermissions(sessionUser, currStage);

        console.log(`DocumentResource.moveNext, action=getting maxSeq,
        currStage=${currStage.id}, currSeq=${currStage.sequenceId}`);
        // Used to determine if the document is done in its workflow.
        const maxSeq = await this.getMaxStageSequenceId(workflowId);
        console.log(`DocumentResource.moveNext, action=got maxSeq, maxSeq=${maxSeq}`);

        // The document can be moved forward.
        if ((currStage.sequenceId + 1) <= maxSeq) {
            console.log(`DocumentResource.moveNext, action=actually moving the document`);

            // Get id of next stage in sequence.
            const nextStage = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .where(`${DBConstants.STGE_TABLE}.sequenceId = :sid`, {sid: currStage.sequenceId + 1})
                .andWhere(`${DBConstants.STGE_TABLE}.workflowId = :wid`, {wid: workflowId})
                .getOne();

            currDocument.stage = nextStage;
        }

        return this.documentRepository.save(currDocument);

        console.log(`DocumentResource.moveNext, action=moving to next stage, currStage=${currDocument.stage.id}`);
        // It is possible that no updates were made if document is already at the
        // end of its workflows stages.
        // TODO: Relations not loaded, doesn't return stage if at the end.
        return currDocument;
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

        const stageID = await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .select(`${DBConstants.DOCU_TABLE}.stageId`, "val")
            .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: currDocument.id})
            .getRawOne();

        const currStage = await this.workflowService.getStage(stageID.val);

        const workflowID = await this.documentRepository
            .createQueryBuilder(DBConstants.DOCU_TABLE)
            .select(`${DBConstants.DOCU_TABLE}.workflowId`, "val")
            .where(`${DBConstants.DOCU_TABLE}.id = :did`, {did: currDocument.id})
            .getRawOne();

        // The first stage in any workflow is always sequence 1.
        const minSeq = 0;

        // The document can be moved forward.
        if ((currStage.sequenceId - 1) >= minSeq) {
            // Get id of next stage in sequence.
            const prevId = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .select(`${DBConstants.STGE_TABLE}.id`, "val")
                .where(`${DBConstants.STGE_TABLE}.sequenceId = :sid`, {sid: currStage.sequenceId - 1})
                .andWhere(`${DBConstants.STGE_TABLE}.workflowId = :wid`, {wid: workflowID.val})
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
        const sessionUser = this.serviceContext.user();
        const currDocument = await this.documentService.getDocument(did);
        const currStage = currDocument.stage;
        const workflowId = currDocument.workflow.id;

        await this.permissionService.checkSTWritePermissions(sessionUser, currStage);

        // The first stage in any workflow is always sequence 1.
        const minSeq = 0;

        // The document can be moved forward.
        if ((currStage.sequenceId - 1) >= minSeq) {
            // Get id of next stage in sequence.
            const prevStage = await this.stageRepository
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .where(`${DBConstants.STGE_TABLE}.sequenceId = :sid`, {sid: currStage.sequenceId - 1})
                .andWhere(`${DBConstants.STGE_TABLE}.workflowId = :wid`, {wid: workflowId})
                .getOne();

            currDocument.stage = prevStage;
        }

        return this.documentRepository.save(currDocument);

        // It is possible that no updates were made if document is already at the
        // end of its workflows stages.
        // TODO: Relations not loaded, doesn't return stage if at the beginning.
        return currDocument;
    }

    // Get the maximum sequenceId for the given workflows stages.
    private async getMaxStageSequenceId(wid: number): Promise<number> {
        const wf = await this.workflowService.getWorkflow(wid);

        // Check that the workflow has stages.
        const exists = await this.stageRepository.find({ where: { workflow: wf } });
        if (exists.length === 0) {
            return -1;
        }
        // Grab the next sequenceId for this set of workflow stages.
        const maxSeq = await this.stageRepository
            .createQueryBuilder(DBConstants.STGE_TABLE)
            .select(`MAX(${DBConstants.STGE_TABLE}.sequenceId)`, "max")
            .where(`${DBConstants.STGE_TABLE}.workflowId = :id`, {id: wf.id})
            .getRawOne();

        return maxSeq.max;
    }

    private async getMinStageSequenceId(wid: number): Promise<number> {
        const wf = await this.workflowService.getWorkflow(wid);

        // Check that the workflow has stages.
        const exists = await this.stageRepository.find({ where: { workflow: wf } });
        if (exists.length === 0) {
            return -1;
        }

        // Grab the next sequenceId for this set of workflow stages.
        const minSeq = await this.stageRepository
            .createQueryBuilder(DBConstants.STGE_TABLE)
            .select(`MIN(${DBConstants.STGE_TABLE}.sequenceId)`, "min")
            .where(`${DBConstants.STGE_TABLE}.workflowId = :id`, {id: wf.id})
            .getRawOne();

        return minSeq.min;
    }
}
