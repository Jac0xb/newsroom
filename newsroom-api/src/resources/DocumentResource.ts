import { Inject } from "typedi";
import { IsNull, Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context, DELETE, GET, Path, PathParam, POST,
         PreProcessor, PUT, ServiceContext } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { BadRequestError } from "typescript-rest/dist/server/model/errors";
import { DBConstants, NRDocument, NRStage, NRSTPermission} from "../entity";
import { DocumentService } from "../services/DocumentService";
import { PermissionService } from "../services/PermissionService";
import { NotificationService } from "../services/triggers/NotificationService";
import { UserService } from "../services/UserService";
import { WorkflowService } from "../services/WorkflowService";
import { createDocumentValidator, updateDocumentValidator } from "../validators/DocumentValidators";

@Path("/api/documents")
@Tags("Documents")
export class DocumentResource {
    @Context
    private serviceContext: ServiceContext;

    @InjectRepository(NRStage)
    private stRep: Repository<NRStage>;

    @InjectRepository(NRDocument)
    private dcRep: Repository<NRDocument>;

    @InjectRepository(NRSTPermission)
    private stPRep: Repository<NRSTPermission>;

    @Inject()
    private wfServ: WorkflowService;

    @Inject()
    private dcServ: DocumentService;

    @Inject()
    private permServ: PermissionService;

    @Inject()
    private usServ: UserService;

    @Inject()
    private notificationService: NotificationService;

    /**
     * Create a new document based on passed information.
     *
     * path:
     *      - None.
     *
     * request:
     *      {
     *          name: <string>,
     *          workflow: <NRWorkflow>,
     *          stage: <NRStage>,
     *          description: <string>
     *      }
     *          - workflow: Needs to be a full workflow "object" but only "id" needs to be populated.
     *                      Must be present in the request.
     *          - stage: Not required, but if passed should be a full NRStage object, but only requires
     *                   the "id" to be present.
     *                   If not passed, document will go in the first stage of the workflow.
     *                   Permissions are checked against the permissions of this stage.
     *
     * response:
     *      - NRDocument with the following relations:
     *          - stage: The stage in which the document was created.
     *          - permission: The permissions the logged in user has for the document.
     *          - creator: The logged in user that created the document.
     *      - BadRequestError(400)
     *          - If document properties missing.
     *          - If document properties are wrong.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to create documents.
     */
    @POST
    @PreProcessor(createDocumentValidator)
    public async createDocument(document: NRDocument): Promise<NRDocument> {
        const user = await this.serviceContext.user();
        const wf = await this.wfServ.getWorkflow(document.workflow.id);

        // Assign the document to the first stage in a workflow if no stage was passed.
        if (!(document.stage)) {
            const minSeq = await this.wfServ.getMinStageSequenceId(wf);

            if (minSeq === null) {
                const errStr = `Can't create a document in workflow ${wf.id} with no stages.`;

                console.log(errStr);
                throw new BadRequestError(errStr);
            }

            document.stage = await this.stRep.findOne({ where: { workflow: wf, sequenceId: minSeq } });
        } else {
            const st = await this.wfServ.getStage(document.stage.id);

            document.stage = st;
        }

        // Check permissions to stage.
        await this.permServ.checkSTWritePermissions(user, document.stage);

        // They have permissions, so we know they have WRITE access already.
        document.permission = DBConstants.WRITE;

        document.creator = await this.usServ.getUser(user.id);
        document.googleDocId = await this.dcServ.createGoogleDocument(user, document);

        return await this.dcRep.save(document);
    }

    /**
     * Get all existing documents.
     *
     * path:
     *      - None.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRDocument[] where each has the following relations:
     *          - permission: The permissions for the logged in user to the document.
     */
    @GET
    public async getDocuments(): Promise<NRDocument[]> {
        const user = await this.serviceContext.user();
        const dcs = await this.dcRep.find();

        await this.dcServ.appendPermsToDCS(dcs, user);
        return dcs;
    }

    /**
     * Get all documents a user has write permissions on.
     *
     * path:
     *      - None.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRDocument[] where each has the following relations:
     *          - permission: The permissions for the logged in user to the document.
     */
    @GET
    @Path("/user")
    public async getUserDocuments(): Promise<NRDocument[]> {
        console.log("CALLED USER ENDPOINT");
        const usr = await this.serviceContext.user();
        const docs = new Set<NRDocument>();

        // Group permissions.
        const ar = await this.usServ.getUserRoles(usr.id);
        for (const rl of ar) {
            const stp = await this.stPRep.find({ relations: ["stage"],
                                                 where: { access: DBConstants.WRITE,
                                                          role: rl } });

            for (const st of stp) {
                const stdocs = await this.dcRep.find({ where: { stage: st.stage }});
                for (const dc of stdocs) {
                    docs.add(dc);
                }
            }
        }

        return Array.from(docs.values());
    }

    /**
     * Get a specific document by ID.
     *
     * path:
     *      - did: The unique id of the document in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRDocument with the following relations:
     *          - permission: The permissions for the logged in user to the document.
     *      - NotFoundError (404)
     *          - If document not found.
     */
    @GET
    @Path("/:did")
    public async getDocument(@PathParam("did") did: number): Promise<NRDocument> {
        const user = await this.serviceContext.user();
        console.log("CALLED INDIV ENDPOINT");
        const dc = await this.dcServ.getDocument(did);
        const dcwst = await this.dcRep.findOne(dc.id, { relations: ["stage", "workflow", "workflow.stages"] });

        await this.dcServ.appendPermToDC(dcwst, dcwst.stage, user);

        return dcwst;
    }

    /**
     * Get all documents for a specific author.
     *
     * path:
     *      - aid: The unique id for the user being queried as the author.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRDocument[] where each has the following relations:
     *          - None.
     */
    @GET
    @Path("/author/:aid")
    public async getDocumentsForAuthor(@PathParam("aid") aid: number): Promise<NRDocument[]> {
        console.log("CALLED AUTHOR ENDPOINT");
        const user = await this.usServ.getUser(aid);
        const udcs = await this.dcRep.find({ where: { creator: user } });

        return udcs;
    }

    /**
     * Get all documents for a given stage.
     *
     * path:
     *      - sid: The unique id of the stage being queried.
     *
     * request:
     *      - None.
     *
     * Returns:
     *      - NRDocument[] where each has the following relations:
     *          - None.
     *      - NotFoundError (404)
     *          - If stage not found.
     */
    @GET
    @Path("/stage/:sid")
    public async getAllDocumentsForStage(@IsInt @PathParam("sid") sid: number): Promise<NRDocument[]> {
        console.log("CALLED STAGE ENDPOINT");
        const st = await this.wfServ.getStage(sid);

        return await this.dcRep.find({ where: { stage: st } });
    }

    /**
     * Get all documents for a given workflow.
     *
     * path:
     *      - wid: The unique id of the workflow being queried.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRDocument[] where each has the following relations:
     *          - None.
     *      - NotFoundError (404)
     *          - If workflow not found.
     */
    @GET
    @Path("/workflow/:wid")
    public async getAllDocumentsForWorkflow(@IsInt @PathParam("wid") wid: number): Promise<NRDocument[]> {
        console.log("CALLED WORKFLOW ENDPOINT");
        const wf = await this.wfServ.getWorkflow(wid);

        return await this.dcRep.find({ where: { workflow: wf } });
    }

    /**
     * Get all documents that aren't in a workflow, aren't in a stage, or both.
     *
     * path:
     *      - None.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRDocument[] where aech has the following relations:
     *          - None.
     *      - NotFoundError (404)
     *          - If workflow not found.
     */
    @GET
    @Path("/all/orphan/docs")
    public async getAllOrphanDocuments(): Promise<NRDocument[]> {
        console.log("CALLED ORPHANS ENDPOINT");
        return await this.dcRep.find( { where: [ { stage: IsNull(),
                                                   workflow: IsNull() } ] });
    }

    /**
     * Update a document based on passed information.
     *
     * path:
     *      - did: The unique id of the document in question.
     *
     * request:
     *      {
     *          name: <string>,
     *          description: <string>
     *      }
     *          - Don't have to pass either, but those that are passed will be updated.
     *
     * response:
     *      - NRDocument updated based on passed information and with the following relations:
     *          - permission: The permissions for the logged in user to the document.
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
        const user = await this.serviceContext.user();
        const dc = await this.dcServ.getDocument(did);
        const dcwst = await this.dcRep.findOne(dc.id, { relations: ["stage"] });

        await this.permServ.checkSTWritePermissions(user, dcwst.stage);

        if (document.name) {
            dc.name = document.name;

            await this.dcServ.updateGoogleDocumentTitle(user, dc);
        }

        if (document.description) {
            dc.description = document.description;
        }

        await this.dcRep.save(dc);
        await this.dcServ.appendPermToDC(dc, dcwst.stage, user);
        return dc;
    }

    /**
     * Delete a document.
     *
     * path:
     *      - did: The unique id of the document to delete.
     *
     * request:
     *      - None.
     *
     * response
     *      - NoContent (204)
     *          - On success.
     *      - NotFoundError (404)
     *          - If document not found.
     */
    @DELETE
    @Path("/:did")
    public async deleteDocument(@IsInt @PathParam("did") did: number) {
        const user = await this.serviceContext.user();
        const dc = await this.dcServ.getDocument(did);
        const dcwst = await this.dcRep.findOne(dc.id, { relations: ["stage"] });

        await this.permServ.checkSTWritePermissions(user, dcwst.stage);

        await this.dcRep.remove(dc);
    }

    /**
     * Move a document to the next stage.
     *
     * path:
     *      - did: The unique id of the document in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRDocument with the following relations:
     *          - permission: The permissions for the logged in user to the document.
     *          - stage: The stage that the document has been moved to, if at all.
     *      - Forbidden Error (403)
     *          - If user isn't authorized to move stage.
     *      - NotFoundError (404)
     *          - If document not found.
     */
    @PUT
    @Path("/:did/next")
    public async moveNext(@IsInt @PathParam("did") did: number): Promise<NRDocument> {
        const user = await this.serviceContext.user();
        await this.dcServ.getDocument(did);

        const cd = await this.dcRep.findOne(did, { relations: ["stage", "workflow"] });
        const cs = cd.stage;
        const cw = cd.workflow;

        // Must have WRITE on current stage to move forward.
        await this.permServ.checkSTWritePermissions(user, cs);

        // Used to determine if the document is done in its workflow.
        const maxSeq = await this.wfServ.getMaxStageSequenceId(cw);

        // The document can be moved forward.
        if ((cs.sequenceId + 1) <= maxSeq) {
            // Get id of next stage in sequence.
            const ns = await this.stRep.findOne({ where: { sequenceId: cs.sequenceId + 1,
                                                           workflow: cw } });

            cd.stage = ns;
        }

        await this.dcRep.save(cd);
        await this.dcServ.appendPermToDC(cd, cd.stage, user);
        return cd;
    }

    /**
     * Move a document to the next stage.
     *
     * path:
     *     - The unique id of the document in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRDocument with the following relations:
     *          - permission: The permissions for the logged in user to the document.
     *          - stage: The stage that the document has been moved to, if at all
     *      - ForbiddenErrr (403)
     *          - If user isn't authorized to move stage.
     *      - NotFoundError (404)
     *          - If document not found.
     *          - If associated stage not found.
     */
    @PUT
    @Path("/:did/prev")
    public async movePrev(@IsInt @PathParam("did") did: number): Promise<NRDocument> {
        const user = await this.serviceContext.user();
        await this.dcServ.getDocument(did);

        const cd = await this.dcRep.findOne(did, { relations: ["stage", "workflow"] });
        const cs = cd.stage;
        const cw = cd.workflow;

        await this.permServ.checkSTWritePermissions(user, cs);

        // The first stage in any workflow is always sequence 1.
        const minSeq = 1;

        // The document can be moved forward.
        if ((cs.sequenceId - 1) >= minSeq) {
            // Get id of next stage in sequence.
            const ps = await this.stRep.findOne({ where: { sequenceId: cs.sequenceId - 1,
                                                           workflow: cw } });

            cd.stage = ps;
        }

        await this.dcRep.save(cd);
        await this.dcServ.appendPermToDC(cd, cd.stage, user);
        return cd;
    }
}
