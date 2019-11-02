import { IsNull, Repository } from "typeorm";
import {
    Context,
    DELETE,
    Errors,
    GET,
    Path,
    PathParam,
    POST,
    PreProcessor,
    PUT,
    ServiceContext,
} from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";

import { Inject } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { DBConstants, NRDocument, NRRole, NRStage, NRSTPermission, NRUser, NRWFPermission, NRWorkflow } from "../entity";
import { DocumentService } from "../services/DocumentService";
import { PermissionService } from "../services/PermissionService";
import { RoleService } from "../services/RoleService";
import { WorkflowService } from "../services/WorkflowService";
import { createRoleValidator, updateRoleValidator } from "../validators/RoleValidators";

@Path("/api/roles")
@Tags("Roles")
export class RoleResource {
    @Context
    private serviceContext: ServiceContext;

    @InjectRepository(NRRole)
    private rlRep: Repository<NRRole>;

    @InjectRepository(NRStage)
    private stRep: Repository<NRStage>;

    @InjectRepository(NRWorkflow)
    private wfRep: Repository<NRWorkflow>;

    @InjectRepository(NRDocument)
    private dcRep: Repository<NRDocument>;

    @InjectRepository(NRWFPermission)
    private wfPRep: Repository<NRWFPermission>;

    @InjectRepository(NRSTPermission)
    private stPRep: Repository<NRSTPermission>;

    @InjectRepository(NRUser)
    private usrRep: Repository<NRUser>;

    @Inject()
    private wfServ: WorkflowService;

    @Inject()
    private dcServ: DocumentService;

    @Inject()
    private rlServ: RoleService;

    @Inject()
    private permServ: PermissionService;

    /**
     * Create a new role.
     *
     * Returns:
     *      - NRRole
     *      - BadRequestError (400)
     *          - If form submission data is invalid.
     */
    @POST
    @PreProcessor(createRoleValidator)
    public async createRole(role: NRRole): Promise<NRRole> {
        console.log("CALLED createRole");
        const user = await this.serviceContext.user();

        const admin = await this.permServ.isUserAdmin(user);
        if (!(admin)) {
            const msg = "Only admins can create roles.";
            throw new Errors.ForbiddenError(msg);
        }

        try {
            // Form data already validated.
            const newRole = await this.rlRep.save(role);

            if (role.wfpermissions !== undefined) {
                for (let i = 0; i < role.wfpermissions.length; i++) {
                    const wfp = role.wfpermissions[i];

                    wfp.workflow = await this.wfRep.findOne(wfp.workflow.id);
                    wfp.role = newRole;

                    await this.wfPRep.save(wfp);
                    await this.rlRep.save(newRole);
                    await this.wfRep.save(wfp.workflow);

                    // Prevent circular stringify problems.
                    wfp.role = undefined;
                }
            }

            if (role.stpermissions !== undefined) {
                for (let i = 0; i < role.stpermissions.length; i++) {
                    const stp = role.stpermissions[i];

                    stp.stage = await this.stRep.findOne(stp.stage.id);
                    stp.role = newRole;
                    stp.access = stp.access;

                    await this.stPRep.save(stp);
                    await this.rlRep.save(newRole);
                    await this.stRep.save(stp.stage);

                    await this.dcServ.syncGooglePermissionsForStage(stp);

                    // Prevent circular stringify problems.
                    stp.role = undefined;
                }
            }

            return newRole;
        } catch (err) {
            console.log(err);

            const errStr = `Error creating role.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all existing roles.
     *
     * Returns:
     *      - NRRole[]
     */
    @GET
    public async getAllRoles(): Promise<NRRole[]> {
        console.log("CALLED getAllRoles");
        try {
            return await this.rlRep.find({
                relations: ["stpermissions", "stpermissions.stage",
                    "wfpermissions", "wfpermissions.workflow"],
            });
        } catch (err) {
            console.log(err);

            const errStr = `Error getting roles.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get a specific role by ID.
     *
     * Returns:
     *      - NRRole
     *      - NotFoundError (404)
     *          - If role not found.
     */
    @GET
    @Path("/:rid")
    public async getRole(@IsInt @PathParam("rid") rid: number): Promise<NRRole> {
        console.log("CALLED getRole");
        const role = await this.rlServ.getRole(rid);

        const allRoles = await this.rlRep.findOne(role.id, {relations: ["users", "stpermissions", "wfpermissions"]});

        // Load stage with each stage permission.
        if (allRoles.stpermissions !== undefined) {
            for (const stp of allRoles.stpermissions) {
                const stpdb = await this.stPRep.findOne(stp.id, {relations: ["stage"]});
                const st = stpdb.stage;

                if (st !== undefined) {
                    const wfid = await this.stRep
                                           .createQueryBuilder(DBConstants.STGE_TABLE)
                                           .select("stage.workflowId", "val")
                                           .where("stage.id = :sid", {sid: st.id})
                                           .getRawOne();

                    stp.stage = st;
                    stp.stage.workflow = new NRWorkflow();
                    stp.stage.workflow.id = wfid.val;
                }
            }
        }

        return allRoles;
    }

    /**
     * Update a given role.
     *
     * Returns:
     *      - NRRole
     *      - BadRequestError (400)
     *          - If proeprties incorrect.
     *      - NotFoundError (404)
     *          - If role not found.
     */
    @PUT
    @Path("/:rid")
    @PreProcessor(updateRoleValidator)
    public async updateRole(@IsInt @PathParam("rid") rid: number,
                            role: NRRole): Promise<NRRole> {
        console.log("CALLED updateRole");
        const user = await this.serviceContext.user();
        const currRole = await this.rlServ.getRole(rid);

        const admin = await this.permServ.isUserAdmin(user);
        if (!(admin)) {
            const msg = "Only admins can update roles.";
            throw new Errors.ForbiddenError(msg);
        }

        if (role.name) {
            currRole.name = role.name;
        }

        if (role.description) {
            currRole.description = role.description;
        }

        // Do stages first so Google syncing can happen.
        if (role.stpermissions !== undefined) {
            currRole.stpermissions = role.stpermissions;
            
            // Filter items that exist in the DB, but not in the list.
            const stpdb = await this.stPRep.find({ where: { role: currRole } });
            const missing = stpdb.filter(item => currRole.stpermissions.indexOf(item) < 0);

            // Now revoke GD permissions because we are going to delete this permission.
            for (const stp of missing) {
                stp.access = DBConstants.READ;
                await this.stPRep.save(stp);
                await this.dcServ.syncGooglePermissionsForStage(stp);
            }

            // This causes the stpermission.roleId to be NULL.
            await this.rlRep.save(currRole);

            // Now remove them.
            const stptd = await this.stPRep.find({ where: { role: IsNull() } });
            await this.stPRep.remove(stptd);
        }

        if (role.users !== undefined) {
            currRole.users = role.users;
        }

        if (role.wfpermissions !== undefined) {
            currRole.wfpermissions = role.wfpermissions;
            await this.rlRep.save(currRole);

            const wfptd = await this.wfPRep.find({ where: { role: IsNull() } });
            await this.wfPRep.remove(wfptd);
        }


        try {
            return await this.rlRep.findOne(rid, { relations: ["users", "stpermissions", "wfpermissions"] });
        } catch (err) {
            console.log(err);

            const errStr = `Error updating roles.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete a role.
     *
     * Returns:
     *      - NotFoundError (404)
     *          - If role not found.
     */
    @DELETE
    @Path("/:rid")
    public async deleteRole(@IsInt @PathParam("rid") rid: number) {
        console.log("CALLED deleteRole");
        const currRole = await this.rlServ.getRole(rid);
        const user = await this.serviceContext.user();

        const admin = await this.permServ.isUserAdmin(user);
        if (!(admin)) {
            const msg = "Only admins can delete roles.";
            throw new Errors.ForbiddenError(msg);
        }

        try {
            await this.rlRep.remove(currRole);
        } catch (err) {
            console.log(err);

            const errStr = `Error deleting role.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Add or switch permissions on a workflow for a role.
     *
     * Returns:
     *      - NRRole
     *      - NotFoundError (404)
     *          - If role not found.
     *          - If workflow not found.
     */
    @PUT
    @Path("/:rid/workflow/:wid")
    public async addWFPermission(@IsInt @PathParam("rid") rid: number,
                                 @IsInt @PathParam("wid") wid: number,
                                 access: any): Promise<NRWFPermission> {
        console.log("CALLED addWFPermission");
        let perm: NRWFPermission;

        const wf = await this.wfServ.getWorkflow(wid);
        const rl = await this.rlServ.getRole(rid);
        const user = await this.serviceContext.user();

        const admin = await this.permServ.isUserAdmin(user);
        if (!(admin)) {
            const msg = "Only admins can assign role permissions.";
            throw new Errors.ForbiddenError(msg);
        }

        try {
            perm = await this.permServ.getWFPermissionFromWFRL(wf, rl);
        } catch (NotFoundError) {
            perm = new NRWFPermission();
        }

        perm.workflow = wf;
        perm.role = rl;
        perm.access = access.access;

        return await this.wfPRep.save(perm);
    }

    /**
     * Remove permissions on a workflow for a role.
     *
     * path:
     *      - wid: The id of the workflow in question.
     *      - rid: The id of the role in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - None.
     *      - NotFoundError (404)
     *          - If role or stage not found.
     */
    @DELETE
    @Path("/:rid/workflow/:wid")
    public async removeWFPermission(@IsInt @PathParam("rid") rid: number,
                                    @IsInt @PathParam("wid") wid: number): Promise<void> {
        console.log("CALLED removeWFPermission");

        const user = await this.serviceContext.user();
        const admin = await this.permServ.isUserAdmin(user);
        if (!(admin)) {
            const msg = "Only admins can remove role permissions.";
            throw new Errors.ForbiddenError(msg);
        }

        const wf = await this.wfServ.getWorkflow(wid);
        const rl = await this.rlServ.getRole(rid);

        const awfp = await this.wfPRep.find({ where: { workflow: wf, role: rl } });

        await this.wfPRep.remove(awfp);
        return;
    }

    /**
     * Add or switch permissions on a stage for a role.
     *
     * Returns:
     *      - NRRole
     *      - NotFoundError (404)
     *          - If role not found.
     *          - If stage not found.
     */
    @PUT
    @Path("/:rid/stage/:sid")
    public async addSTPermission(@IsInt @PathParam("rid") rid: number,
                                 @IsInt @PathParam("sid") sid: number,
                                 access: any): Promise<NRSTPermission> {
        console.log("CALLED addSTPermission");
        let perm: NRSTPermission;

        const st = await this.wfServ.getStage(sid);
        const rl = await this.rlServ.getRole(rid);
        const user = await this.serviceContext.user();

        const admin = await this.permServ.isUserAdmin(user);
        if (!(admin)) {
            const msg = "Only admins can assign role permissions.";
            throw new Errors.ForbiddenError(msg);
        }

        try {
            perm = await this.permServ.getSTPermissionFromSTRL(st, rl);
        } catch (NotFoundError) {
            perm = new NRSTPermission();
        }

        perm.access = access.access;
        perm.stage = st;
        perm.role = rl;

        await this.dcServ.syncGooglePermissionsForStage(perm);

        await this.stRep.save(st);
        await this.rlRep.save(rl);
        return await this.stPRep.save(perm);
    }

    /**
     * Remove permissions on a stage for a role.
     *
     * path:
     *      - sid: The id of the stage in question.
     *      - rid: The id of the role in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - None.
     *      - NotFoundError (404)
     *          - If role or stage not found.
     */
    @DELETE
    @Path("/:rid/stage/:sid")
    public async removeSTPermission(@IsInt @PathParam("rid") rid: number,
                                    @IsInt @PathParam("sid") sid: number): Promise<void> {
        console.log("CALLED removeSTPermission");

        const user = await this.serviceContext.user();
        const admin = await this.permServ.isUserAdmin(user);
        if (!(admin)) {
            const msg = "Only admins can remove role permissions.";
            throw new Errors.ForbiddenError(msg);
        }

        const st = await this.wfServ.getStage(sid);
        const rl = await this.rlServ.getRole(rid);

        const astp = await this.stPRep.find({ where: { stage: st, role: rl } });

        await this.stPRep.remove(astp);
        return;
    }
}
