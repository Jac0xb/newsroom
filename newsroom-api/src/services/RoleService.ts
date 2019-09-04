import * as express from "express";
import { getManager } from "typeorm";
import { Context, DELETE, GET, Path, PathParam, POST, PreProcessor, PUT, ServiceContext } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";

import { NRPermission } from "../entity/NRPermission";
import { NRRole } from "../entity/NRRole";
import { NRType } from "../entity/NRType";
import { NRUser } from "../entity/NRUser";
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
    private permRepository = getManager().getRepository(NRPermission);

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
        const sessionUser = common.getUserFromContext(this.context);
        await common.checkAdmin(sessionUser);

        // Form data already validated.
        return await this.roleRepository.save(role);
    }

    /**
     * Get all existing roles.
     *
     * Returns:
     *      - NRRole[]
     */
    @GET
    public async getAllRoles(): Promise<NRRole[]> {
        return await this.roleRepository.find();
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
    @Path(":/rid")
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
        const sessionUser = common.getUserFromContext(this.context);
        const currRole = await common.getRole(rid, this.roleRepository);
        await common.checkWritePermissions(sessionUser, NRType.ROLE_KEY, rid);

        // Update current stored name if given one.
        if (role.name) {
            currRole.name = role.name;
        }

        return await this.roleRepository.save(currRole);
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
        const sessionUser = common.getUserFromContext(this.context);
        const currRole = await common.getRole(rid, this.roleRepository);
        await common.checkWritePermissions(sessionUser, NRType.ROLE_KEY, rid);

        await this.roleRepository.remove(currRole);
    }

    /**
     * Add a permission to a role.
     *
     * Returns:
     *      - NRRole
     *      - NotFoundError (404)
     *          - If role not found.
     */
    @PUT
    @Path("/:rid/add/:pid")
    public async addPermission(@IsInt @PathParam("rid") rid: number,
                               @IsInt @PathParam("pid") pid: number): Promise<NRRole> {
        const sessionUser = common.getUserFromContext(this.context);
        const currRole = await common.getRole(rid, this.roleRepository);
        await common.checkWritePermissions(sessionUser, NRType.ROLE_KEY, rid);

        // Check existence.
        const newPermission = await common.getPermission(pid, this.permRepository);

        currRole.permissions.push(newPermission);
        return await this.roleRepository.save(currRole);
    }

   /**
    * Remove a permission to a role.
    *
    * Returns:
    *      - NRRole
    *      - NotFoundError (404)
    *          - If role not found.
    */
    @PUT
    @Path("/:rid/remove/:pid")
    public async removePermission(@IsInt @PathParam("rid") rid: number,
                                  @IsInt @PathParam("pid") pid: number): Promise<NRRole> {
        const sessionUser = common.getUserFromContext(this.context);
        const currRole = await common.getRole(rid, this.roleRepository);
        await common.checkWritePermissions(sessionUser, NRType.ROLE_KEY, rid);

        // Check existence.
        const newPermission = await common.getPermission(pid, this.permRepository);

        // Remove relationship and save.
        const ind = currRole.permissions.indexOf(newPermission);
        currRole.permissions.splice(ind, 1);
        return await this.roleRepository.save(currRole);
    }

}
