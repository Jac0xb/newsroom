import * as express from "express";
import { getManager } from "typeorm";
import { Context, DELETE, Errors, GET, Path, PathParam,
         POST, PreProcessor, PUT, ServiceContext } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";

import { NRDCPermission, NRDocument, NRRole,
         NRStage, NRSTPermission, NRUser,
         NRWFPermission, NRWorkflow } from "../entity";
import { common } from "./Common";
import { validators } from "./Validators";

// Provides API services for roles.
@Path("/api/roles")
@Tags("Roles")
export class RoleService {
    // Context manager to grab injected user from the request.
    @Context
    private context: ServiceContext;

    // Database interactions managers.
    private roleRepository = getManager().getRepository(NRRole);
    private stageRepository = getManager().getRepository(NRStage);
    private workflowRepository = getManager().getRepository(NRWorkflow);
    private documentRepository = getManager().getRepository(NRDocument);
    private permWFRepository = getManager().getRepository(NRWFPermission);
    private permSTRepository = getManager().getRepository(NRSTPermission);
    private permDCRepository = getManager().getRepository(NRDCPermission);

    /**
     * Create a new role.
     *
     * Returns:
     *      - NRRole
     *      - BadRequestError (400)
     *          - If form submission data is invalid.
     */
    @POST
    @PreProcessor(validators.createRoleValidator)
    public async createRole(role: NRRole): Promise<NRRole> {
        try {
            // Form data already validated.
            return await this.roleRepository.save(role);
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
        return await common.getRole(rid, this.roleRepository);
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
    @PreProcessor(validators.updateRoleValidator)
    public async updateRole(@IsInt @PathParam("rid") rid: number,
                            role: NRRole): Promise<NRRole> {
        const currRole = await common.getRole(rid, this.roleRepository);

        // Update current stored name if given one.
        if (role.name) {
            currRole.name = role.name;
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
        const currRole = await common.getRole(rid, this.roleRepository);

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
    @Path("/:rid/workflow")
    public async addWFPermission(@IsInt @PathParam("rid") rid: number,
                                 permission: NRWFPermission): Promise<NRRole> {
        let newPerm: NRWFPermission;

        try {
            newPerm = await common.getWFPermission(permission.id, this.permWFRepository);
        } catch (NotFoundError) {
            newPerm = new NRWFPermission();
            newPerm.access = permission.access;
            newPerm.role = permission.role;
            newPerm.workflow = permission.workflow;
        }

        const role = await common.getRole(rid, this.roleRepository);
        const wf = await common.getWorkflow(newPerm.workflow.id, this.workflowRepository);

        try {
            newPerm.workflow = wf;
            newPerm.role = role;

            await this.permWFRepository.save(newPerm);
            await this.workflowRepository.save(wf);
            return await this.roleRepository.save(role);
        } catch (err) {
            console.log(err);

            const errStr = `Error adding WF permission.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Add or switch permissions on a stage for a role.
     *
     * Returns:
     *      - NRRole
     *      - NotFoundError (404)
     *          - If role not found.
     *          - If workflow not found.
     */
    @PUT
    @Path("/:rid/stage")
    public async addSTPermission(@IsInt @PathParam("rid") rid: number,
                                 permission: NRSTPermission): Promise<NRRole> {
        let newPerm: NRSTPermission;

        try {
            newPerm = await common.getSTPermission(permission.id, this.permSTRepository);
        } catch (NotFoundError) {
            newPerm = new NRSTPermission();
            newPerm.access = permission.access;
            newPerm.role = permission.role;
            newPerm.stage = permission.stage;
        }

        const stage = await common.getStage(permission.stage.id, this.stageRepository);
        const role = await common.getRole(rid, this.roleRepository);

        try {
            newPerm.stage = stage;
            newPerm.role = role;

            await this.permWFRepository.save(newPerm);
            await this.stageRepository.save(stage);
            return await this.roleRepository.save(role);
        } catch (err) {
            console.log(err);

            const errStr = `Error adding ST permission.`;
            throw new Errors.InternalServerError(errStr);
        }
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
            newPerm = await common.getDCPermission(permission.id, this.permDCRepository);
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

        const doc = await common.getDocument(permission.document.id, this.documentRepository);
        const role = await common.getRole(rid, this.roleRepository);

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
