import * as express from "express";
import { getManager } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

import { NRRole } from "../entity/NRRole";
import { NRUser } from "../entity/NRUser";
import { validators } from "./Validators";

/**
 * Provides API services for roles.
 */
@Path("/api/roles")
@Tags("Roles")
export class RoleService {
    /**
     * Used to interact with any specified type in the database.
     */
    private roleRepository = getManager().getRepository(NRRole);

    /**
     * Create a new entry in the 'role' table with the specified
     * information.
     *
     * Returns 400 if:
     *      -
     *
     * Returns 404 if:
     *      - Bad parameters.
     */
    @POST
    @PreProcessor(validators.createRoleValidator)
    public async createRole(role: NRRole): Promise<NRRole> {
        // Form data already validated above.
        return await this.roleRepository.save(role);
    }

    /**
     * Get all roles that exist in the 'role' table under
     * the configured connection.
     */
    @GET
    public async getAllRoles(): Promise<NRRole[]> {
        return await this.roleRepository.find();
    }

    /**
     * Get a specific role from the 'role' table based on passed
     * role id.
     *
     * Returns 404 if:
     *      - Role now found.
     */
    @GET
    @Path(":/id")
    public async getRole(@IsInt @PathParam("id") roleId: number): Promise<NRRole> {
        try {
            return await this.roleRepository.findOneOrFail(roleId);
        } catch (err) {
            console.error("Error getting Role:", err);
            throw new NotFoundError("A Role with the given ID was not found.");
        }
    }

    /**
     * Update an entry in the 'role' table with the specified
     * information.
     *
     * Return 400 if:
     *      - Role property types incorrect.
     *
     * Return 404 if:
     *      - Role id field is missing or not found.
     */
    @PUT
    @Path("/:id")
    @PreProcessor(validators.updateRoleValidator)
    public async updateRole(@IsInt @PathParam("id") roleId: number,
                            role: NRRole): Promise<NRRole> {
        let currRole: NRRole;

        try {
            currRole = await this.roleRepository.findOneOrFail(roleId);
        } catch (err) {
            console.error("Error getting Role:", err);
            throw new NotFoundError("A Role with the given ID was not found.");
        }

        // Update current stored name if given one.
        if (role.name) {
            currRole.name = role.name;
        }

        return await this.roleRepository.save(currRole);
    }

    /**
     * Delete a role.
     *
     * Returns 404 if:
     *      - Role id not found.
     */
    @DELETE
    @Path("/:id")
    public async deleteRole(@IsInt @PathParam("id") roleId: number) {
        let currRole: NRRole;

        try {
            currRole = await this.roleRepository.findOneOrFail(roleId);
        } catch (err) {
            console.error("Error getting Role:", err);
            throw new NotFoundError("A Role with the given ID was not found.");
        }

        await this.roleRepository.remove(currRole);
    }
}
