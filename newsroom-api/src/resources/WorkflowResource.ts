import { Inject } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Context, DELETE, Errors, GET, Path, PathParam,
         POST, PreProcessor, PUT, ServiceContext } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { DBConstants, NRDocument, NRStage, NRWorkflow } from "../entity";
import { PermissionService } from "../services/PermissionService";
import { UserService } from "../services/UserService";
import { WorkflowService } from "../services/WorkflowService";
import { addStageValidator, updateStageValidator } from "../validators/StageValidators";
import { createWorkflowValidator,
         updateWorkflowValidator } from "../validators/WorkflowValidators";

@Path("/api/workflows")
@Tags("Workflows")
export class WorkflowResource {
    @Context
    private servCont: ServiceContext;

    @InjectRepository(NRStage)
    private stRep: Repository<NRStage>;

    @InjectRepository(NRWorkflow)
    private wfRep: Repository<NRWorkflow>;

    @InjectRepository(NRDocument)
    private dcRep: Repository<NRDocument>;

    @Inject()
    private usServ: UserService;

    @Inject()
    private wfServ: WorkflowService;

    @Inject()
    private permServ: PermissionService;

    /**
     * Create a new workflow based on the passed information.
     *
     * path:
     *      - None.
     *
     * request:
     *      {
     *          "name": <string>,
     *          "description": <string>,
     *          "permission": <number>
     *      }
     *          - name: Must be unique versus other names.
     *          - permission: 1 to create with WRITE, 0 to create with READ, or not passed at all.
     *                        This permission is created for the logged in user only, not related to groups.
     *
     * response:
     *      - NRWorkflow object with the following relations:
     *          - permission: The READ/WRITE permissions of the user for this workflow.
     */
    @POST
    @PreProcessor(createWorkflowValidator)
    public async createWorkflow(wf: NRWorkflow): Promise<NRWorkflow> {
        try {
            const user = await this.servCont.user();
            wf.creator = await this.usServ.getUser(user.id);

            // Only administrators can create workflows.
            const allowed = await this.permServ.isUserAdmin(user);

            if (allowed === true) {
                const wfdb = await this.wfRep.save(wf);
                wfdb.permission = DBConstants.WRITE;

                return wfdb;
            } else {
                throw new Errors.ForbiddenError('Only administrators can create workflows.')
            }
        } catch (err) {
            if (err instanceof Errors.ForbiddenError) {
                throw err;
            } 

            console.error(err);
            const errStr = 'Error creating workflow.';
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all existing workflows.
     *
     * path:
     *      - None.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRWorkflow[] each with the following relations:
     *          - permission: The READ/WRITE permissions of the user for this workflow
     */
    @GET
    public async getWorkflows(): Promise<NRWorkflow[]> {
        try {
            const user = await this.servCont.user();
            const wfs = await this.wfRep.find({ relations: ["stages"]});

            return await this.wfServ.appendPermToWFS(wfs, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error getting workflows.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get a specific workflow.
     *
     * path:
     *      - wid: The primary key of the workflow in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRWorkflow with the following relations:
     *          - stages: All stages that exist in this workflow.
     *              - permission: This will match the users permissions over the workflow.
     *          - permission: The READ/WRITE permissions of the user for this workflow
     */
    @GET
    @Path("/:wid")
    public async getWorkflow(@IsInt @PathParam("wid") wid: number): Promise<NRWorkflow> {
        const user = await this.servCont.user();
        let wf = await this.wfServ.getWorkflow(wid);
        wf = await this.wfServ.addStageRelationsToWF(wf);

        // User can edit any stage based on permissions to the workflow itself.
        const wfr = await this.wfServ.appendPermToWF(wf, user);
        this.wfServ.matchSTPermToWF(wfr);
        return wfr;
    }

    /**
     * Update information about a workflow.
     *
     * path:
     *      - wid: The primary key of the workflow to update.
     *
     * request:
     *      {
     *          "name": <string>,
     *          "description": <string>
     *      }
     *          - name: Must be unique with regards to other existing workflows.
     *
     * response:
     *      - NRWorkflow with the following relations:
     *          - permission: The READ/WRITE permissions of the user for this workflow
     */
    @PUT
    @Path("/:wid")
    @PreProcessor(updateWorkflowValidator)
    public async updateWorkflow(@IsInt @PathParam("wid") wid: number,
                                workflow: NRWorkflow): Promise<NRWorkflow> {
        const user = await this.servCont.user();
        let wf = await this.wfServ.getWorkflow(wid);

        await this.permServ.checkWFWritePermissions(user, wf);

        // Update current stored information if passed..
        if (workflow.name) {
            wf.name = workflow.name;
        }

        if (workflow.description) {
            wf.description = workflow.description;
        }

        try {
            wf = await this.wfRep.save(wf);
            return await this.wfServ.appendPermToWF(wf, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error updating workflow with ID=${wid}`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete a workflow and all associated stages and permissions for each.
     * Document are left with relationships of 'null' to both, see orhpans
     * endpoint for how to get orphan documents.
     *
     * path:
     *      - wid: The primary key of the workflow to delete.
     *
     * request:
     *      - None.
     *
     * returns:
     *      - NoContent (204)
     *          - On success.
     */
    @DELETE
    @Path("/:wid")
    public async deleteWorkflow(@IsInt @PathParam("wid") wid: number): Promise<void> {
        const user = await this.servCont.user();
        const wf = await this.wfServ.getWorkflow(wid);

        await this.permServ.checkWFWritePermissions(user, wf);

        try {
            // Remove stages, but leave documents with relationships as NULL.
            await this.wfRep.remove(wf);

            return;
        } catch (err) {
            console.log(err);

            const errStr = `Error updating workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Add a stage at the end of the workflow.
     *
     * path:
     *      - wid: The primary key of the workflow in question.
     *
     * request:
     *      {
     *          "name": <string>,
     *          "description": <string>,
     *          "permission": <number>
     *      }
     *          - permission: 1 to create with WRITE, 0 to create with READ, or not passed at all.
     *
     * response:
     *      - NRStage that was created with the following relations:
     *          - permission: The permissions for the user who created the stage.
     *      - BadRequestError (400)
     *          - If workflow properties are missing.
     *          - If workflow properties are wrong type.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @POST
    @Path("/:wid/stages")
    @PreProcessor(addStageValidator)
    public async appendStage(@IsInt @PathParam("wid") wid: number,
                             stage: NRStage): Promise<NRStage> {
        const user = await this.servCont.user();
        const wf = await this.wfServ.getWorkflow(wid);

        await this.permServ.checkWFWritePermissions(user, wf);

        const maxSeqId = await this.wfServ.getMaxStageSequenceId(wf);

        if (maxSeqId == null) {
            stage.sequenceId = 1;
        } else {
            stage.sequenceId = maxSeqId + 1;
        }

        try {
            stage.workflow = wf;
            stage.creator = user;

            await this.wfRep.save(wf);
            const st = await this.stRep.save(stage);

            if (stage.permission !== undefined) {
                st.permission = DBConstants.WRITE;
            } else {
                st.permission = DBConstants.READ;
            }

            return st;
        } catch (err) {
            console.log(err);

            const errStr = `Error appending stage to workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all stages for a specific workflow.
     *
     * path:
     *      - wid: The primary key of the workflow in question.
     *
     * request: None.
     *
     * response:
     *      - NRStage[] with the following relations:
     *          - permission: The permissions to the stage for the currently logged in user.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @GET
    @Path("/:wid/stages")
    public async getStages(@IsInt @PathParam("wid") wid: number): Promise<NRStage[]> {
        const user = await this.servCont.user();
        const wf = await this.wfServ.getWorkflow(wid);

        try {
            const stages = await this.stRep.find({ where: { workflow: wf }});

            // Return them in ascending sequence order.
            stages.sort((a: NRStage, b: NRStage) => a.sequenceId - b.sequenceId);
            return await this.wfServ.appendPermToSTS(stages, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error getting stages for workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get a specific stage by ID.
     *
     * path:
     *      - wid: The primary key of the workflow in question.
     *      - sid: The primary key of the stage in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRStage with the following relations:
     *          - permission: The permissions to the stage for the currently logged in user.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @GET
    @Path("/:wid/stages/:sid")
    public async getStage(@IsInt @PathParam("wid") wid: number,
                          @IsInt @PathParam("sid") sid: number): Promise<NRStage> {
        const user = await this.servCont.user();
        await this.wfServ.getWorkflow(wid);

        try {
            // Grab the specified stage for the right workflow.
            const stage = await this.stRep.findOne(sid, { relations: ["documents"] });

            if (stage.documents.length === 0) {
                stage.documents = undefined;
            }

            return await this.wfServ.appendPermToST(stage, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error getting stage for workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Add a stage at the given position in the workflow.
     *
     * path:
     *      - wid: The primary key of the workflow in question.
     *      - position: The position to add the stage at, NOT zero-indexed.
     *
     * request:
     *      {
     *          "name": <string>,
     *          "description": <string>,
     *          "permission": <number>
     *      }
     *          - permission: 1 to create with WRITE, 0 to create with READ, or not passed at all.
     *
     * response:
     *      - NRStage with the following relations:
     *          - permission: The permissions to the stage for the currently logged in user.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @POST
    @Path("/:wid/stages/:pos")
    @PreProcessor(addStageValidator)
    public async addStageAt(stage: NRStage,
                            @IsInt @PathParam("wid") wid: number,
                            @IsInt @PathParam("pos") position: number): Promise<NRStage> {
        // Invalid position.
        if (position <= 0) {
            position = 1;
        }

        const user = await this.servCont.user();
        const wf = await this.wfServ.getWorkflow(wid);

        await this.permServ.checkWFWritePermissions(user, wf);
        stage.creator = user;

        try {
            // Grab the max/min sequenceId for this set of workflow stages.
            const maxSeqId = await this.wfServ.getMaxStageSequenceId(wf);

            // Add if no stages yet.
            if (maxSeqId === null) {
                stage.sequenceId = 1;
            } else if (position > maxSeqId + 1) {
                stage.sequenceId = maxSeqId + 1;
            } else {
                // Insert normally.
                let currSeq = maxSeqId;

                // Update sequences.
                while (currSeq > 0) {
                    if (currSeq === (position - 1)) {
                        break;
                    }

                    await this.stRep
                        .createQueryBuilder(DBConstants.STGE_TABLE)
                        .update(NRStage)
                        .set({sequenceId: currSeq + 1})
                        .where("sequenceId = :sid ", {sid: currSeq})
                        .andWhere("workflowId = :wid", {wid: wf.id})
                        .execute();

                    currSeq--;
                }

                stage.sequenceId = position;
            }

            // Establish the relationship and save it.
            stage.workflow = wf;
            await this.wfRep.save(wf);
            stage = await this.stRep.save(stage);

            if (stage.permission !== undefined) {
                stage.permission = DBConstants.WRITE;
            } else {
                stage.permission = DBConstants.READ;
            }

            return stage;
        } catch (err) {
            console.log(err);

            const errStr = `Error adding stage to workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete the given stage.
     *
     * path:
     *      - wid: The primary key of the workflow in question.
     *      - sid: The primary key of the stage in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NoContent (204)
     *          - On success.
     *      - BadRequestError (400)
     *          - If the position is out of bounds or negative.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *          - If stage not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong.
     */
    @DELETE
    @Path("/:wid/stages/:sid")
    public async deleteStage(@IsInt @PathParam("wid") wid: number,
                             @PathParam("sid") sid: number): Promise<NRStage[]> {
        const user = await this.servCont.user();
        const st = await this.wfServ.getStage(sid);
        const wf = await this.wfServ.getWorkflow(wid);

        await this.permServ.checkWFWritePermissions(user, wf);

        try {
            const maxSeqId = await this.wfServ.getMaxStageSequenceId(wf);
            const minSeqId = await this.wfServ.getMinStageSequenceId(wf);
            const asts = await this.stRep.find({ order: { sequenceId: "ASC" },
                                                 where: { workflow: wf } });
            const docs = await this.dcRep.find({ where: { stage: st } });

            // No stages in the workflow, documents become orphans because we have
            // no where to move them to.
            if ((asts === undefined) || (asts.length === 0) || (asts[0].id === st.id)) {
                for (const dc of docs) {
                    dc.stage = null;
                    dc.workflow = null;
                    await this.dcRep.save(dc);
                }
            } else {
                const fst = await this.stRep.findOne({ where: { sequenceId: minSeqId,
                                                                workflow: wf } });
                // Documents go to first stage in workflow.
                for (const dc of docs) {
                    dc.stage = fst;
                    await this.dcRep.save(dc);
                }
            }

            // Now actually delete the stage and adjust the others.
            await this.stRep
                .createQueryBuilder(DBConstants.STGE_TABLE)
                .delete()
                .from(NRStage)
                .where("id = :stageId", {stageId: st.id})
                .execute();

            let currSeq = st.sequenceId;

            // Nothing to update.
            if (currSeq === maxSeqId) {
                const strss = await this.stRep.find({ relations: ["documents"],
                                                     where: { workflow: wf } });
                return await this.wfServ.appendPermToSTS(strss, user);
            }

            // Update sequences.
            while (currSeq <= maxSeqId) {
                currSeq++;

                await this.stRep
                    .createQueryBuilder(DBConstants.STGE_TABLE)
                    .update(NRStage)
                    .set({sequenceId: currSeq - 1})
                    .where("sequenceId = :id ", {id: currSeq})
                    .andWhere("workflowId = :wfid", {wfid: wf.id})
                    .execute();
            }

            const strs = await this.stRep.find({ relations: ["documents"],
                                                 where: { workflow: wf } });

            return await this.wfServ.appendPermToSTS(strs, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error deleting stage in workflow.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Update the given stage.
     *
     * path:
     *      - wid: The primary key of the workflow in question.
     *      - sid: The primary key of the stage in question.
     *
     * request:
     *      {
     *          "name": <string>,
     *          "permission": <string>
     *      }
     *
     * response:
     *      - NRStage with the following relations:
     *          - permission: The permissions to the stage for the currently logged in user.
     *      - BadRequestError (400)
     *          - If the position is out of bounds or negative.
     *      - ForbiddenError (403)
     *          - If request user is not allowed to update workflows.
     *      - NotFoundError (404)
     *          - If workflow not found.
     *          - If stage not found.
     *      - InternalServerError (500)
     *          - If something went horribly wrong
     */
    @PUT
    @Path("/:wid/stages/:sid")
    @PreProcessor(updateStageValidator)
    public async updateStage(@IsInt @PathParam("wid") wid: number,
                             @IsInt @PathParam("sid") sid: number,
                             stage: NRStage): Promise<NRStage> {
        const user = await this.servCont.user();
        const wf = await this.wfServ.getWorkflow(wid);
        let st = await this.wfServ.getStage(sid);

        await this.permServ.checkWFWritePermissions(user, wf);

        try {
            if (stage.name) {
                st.name = stage.name;
            }

            if (stage.description) {
                st.description = stage.description;
            }

            st = await this.stRep.save(st);
            return await this.wfServ.appendPermToST(st, user);
        } catch (err) {
            console.log(err);

            const errStr = `Error updating stage.`;
            throw new Errors.InternalServerError(errStr);
        }
    }
}
