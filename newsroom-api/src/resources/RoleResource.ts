import { Repository } from "typeorm";
import { Context, DELETE, Errors, GET, Path, PathParam, POST, PreProcessor,
    PUT, ServiceContext } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";

import { Inject } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRDCPermission, NRDocument, NRRole, NRStage, NRSTPermission, NRWFPermission, NRWorkflow } from "../entity";
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
        try {
            // Form data already validated.
            const newRole = await this.rlRep.save(role);

            // for (const wfPerm of newRole.wfpermissions) {
            //     await this.permWFRepository.save(wfPerm);
            // }

            // for (const stPerm of newRole.stpermissions) {
            //     await this.permSTRepository.save(stPerm);
            // }

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
        try {
            return await this.rlRep.find();
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
        const role = await this.rlServ.getRole(rid);
        return await this.rlRep.findOne(role.id, { relations: ["stpermissions", "wfpermissions"] });
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
        const currRole = await this.rlServ.getRole(rid);

        if (role.name) {
            currRole.name = role.name;
        }

        if (role.description) {
            currRole.description = role.description;
        }

        try {
            return await this.rlRep.save(currRole);
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
        const currRole = await this.rlServ.getRole(rid);

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
        let perm: NRWFPermission;

        const wf = await this.wfServ.getWorkflow(wid);
        const rl = await this.rlServ.getRole(rid);

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
        let perm: NRSTPermission;
        let st: NRStage;
        let rl: NRRole;

        try {
            perm = await this.permServ.getSTPermissionFromSTRL(sid, rid);
            st = perm.stage;
            rl = perm.role;
        } catch (NotFoundError) {
            perm = new NRSTPermission();
            rl = await this.rlServ.getRole(rid);
            st = await this.wfServ.getStage(sid);
        }

        perm.access = access.access;

        await this.stRep.save(st);
        await this.rlRep.save(rl);
        return await this.stPRep.save(perm);
    }
}
