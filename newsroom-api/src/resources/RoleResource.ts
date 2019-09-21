import { Repository } from "typeorm";
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
import { NRDCPermission, NRDocument, NRRole, NRStage, NRSTPermission, NRWFPermission, NRWorkflow } from "../entity";
import { DocumentService } from "../services/DocumentService";
import { PermissionService } from "../services/PermissionService";
import { RoleService } from "../services/RoleService";
import { WorkflowService } from "../services/WorkflowService";
import { createRoleValidator, updateRoleValidator } from "../validators/RoleValidators";

// Provides API services for roles.
@Path("/api/roles")
@Tags("Roles")
export class RoleResource {
    @Context
    private serviceContext: ServiceContext;

    @InjectRepository(NRRole)
    private roleRepository: Repository<NRRole>;

    @InjectRepository(NRStage)
    private stageRepository: Repository<NRStage>;

    @InjectRepository(NRWorkflow)
    private workflowRepository: Repository<NRWorkflow>;

    @InjectRepository(NRDocument)
    private documentRepository: Repository<NRDocument>;

    @InjectRepository(NRWFPermission)
    private permWFRepository: Repository<NRWFPermission>;

    @InjectRepository(NRSTPermission)
    private permSTRepository: Repository<NRSTPermission>;

    @InjectRepository(NRDCPermission)
    private permDCRepository: Repository<NRDCPermission>;

    @Inject()
    private workflowService: WorkflowService;

    @Inject()
    private documentService: DocumentService;

    @Inject()
    private roleService: RoleService;

    @Inject()
    private permissionService: PermissionService;

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
            const newRole = await this.roleRepository.save(role);

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
            return await this.roleRepository.find();
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
        const role = await this.roleService.getRole(rid);

        role.stpermissions = await this.permissionService.getAllSTPermissionsForRole(rid);
        role.wfpermissions = await this.permissionService.getAllWFPermissionsForRole(rid);

        return role;
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
        const currRole = await this.roleService.getRole(rid);

        if (role.name) {
            currRole.name = role.name;
        }

        if (role.description) {
            currRole.description = role.description;
        }

        try {
            return await this.roleRepository.save(currRole);
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
        const currRole = await this.roleService.getRole(rid);

        try {
            await this.roleRepository.remove(currRole);
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
                                 access: any): Promise<NRRole> {
        let perm: NRWFPermission;
        let wf: NRWorkflow;
        let rl: NRRole;

        try {
            perm = await this.permissionService.getWFPermissionFromWFRL(wid, rid);
            wf = perm.workflow;
            rl = perm.role;
        } catch (NotFoundError) {
            perm = new NRWFPermission();
            rl = await this.roleService.getRole(rid);
            wf = await this.workflowService.getWorkflow(wid);
        }

        perm.workflow = wf;
        perm.role = rl;
        perm.access = access.access;

        await this.permWFRepository.save(perm);
        await this.workflowRepository.save(wf);
        return await this.roleRepository.save(rl);
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
                                 access: any): Promise<NRRole> {
        let perm: NRSTPermission;
        let st: NRStage;
        let rl: NRRole;

        try {
            perm = await this.permissionService.getSTPermissionFromSTRL(sid, rid);
            st = perm.stage;
            rl = perm.role;
        } catch (NotFoundError) {
            perm = new NRSTPermission();
            rl = await this.roleService.getRole(rid);
            st = await this.workflowService.getStage(sid);
        }

        perm.stage = st;
        perm.role = rl;
        perm.access = access.access;

        await this.permSTRepository.save(perm);
        await this.stageRepository.save(st);
        return await this.roleRepository.save(rl);
    }

    /**
     * Add or switch permissions on a document for a role.
     *
     * Returns:
     *      - NRRole
     *      - NotFoundError (404)
     *          - If role not found.
     *          - If workflow not found.
     */
    @PUT
    @Path("/:rid/document")
    public async addDCPermission(@IsInt @PathParam("rid") rid: number,
                                 permission: NRDCPermission): Promise<NRRole> {
        let newPerm: NRDCPermission;

        try {
            newPerm = await this.permissionService.getDCPermission(permission.id);
            newPerm.id = permission.id;
            newPerm.access = permission.access;
            newPerm.role = permission.role;
            newPerm.document = permission.document;
        } catch (NotFoundError) {
            newPerm = new NRDCPermission();
            newPerm.access = permission.access;
            newPerm.role = permission.role;
            newPerm.document = permission.document;
        }

        const doc = await this.documentService.getDocument(newPerm.document.id);
        const role = await this.roleService.getRole(rid);

        try {
            newPerm.document = doc;
            newPerm.role = role;

            await this.permWFRepository.save(newPerm);
            await this.documentRepository.save(doc);
            return await this.roleRepository.save(role);
        } catch (err) {
            console.log(err);

            const errStr = `Error adding DC permission.`;
            throw new Errors.InternalServerError(errStr);
        }
    }
}
