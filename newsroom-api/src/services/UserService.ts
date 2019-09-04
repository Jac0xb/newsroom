import * as express from "express";
import { getManager } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";

import { NRRole } from "../entity/NRRole";
import { NRUser } from "../entity/NRUser";
import { common } from "./Common";
import { validators } from "./Validators";

// Provides API services for users.
@Path("/api/users")
@Tags("Users")
export class UserService {
    // Database interactions managers.
    private userRepository = getManager().getRepository(NRUser);
    private roleRepository = getManager().getRepository(NRRole);

    /**
     * Create a new user.
     *
     * Returns:
     *      - NRUser
     *      - BadRequestError (400)
     *          - If properties are missing or wrong type.
     */
    @POST
    @PreProcessor(validators.createUserValidator)
    public async createUser(user: NRUser): Promise<NRUser> {
        // Form data already validated above.

        return await this.userRepository.save(user);
    }

    /**
     * Get all existent users.
     *
     * Returns:
     *      - NRUser[]
     */
    @GET
    public async getUsers(): Promise<NRUser[]> {
        return await this.userRepository.find();
    }

    /**
     * Get a specific user by ID.
     *
     * Returns:
     *      - NRUser
     *      - NotFoundError (404)
     *          - If user not found.
     */
    @GET
    @Path(":/uid")
    public async getUser(@IsInt @PathParam("uid") uid: number): Promise<NRUser> {
        return await common.getUser(uid, this.userRepository);
    }

    /**
     * Update a users information
     *
     * Returns:
     *      - NRUser
     *      - BadRequestError (400)
     *          - If form submission invalid.
     *      - NotFoundError (404)
     *          - If user not found.
     */
    @PUT
    @Path("/:uid")
    @PreProcessor(validators.updateUserValidator)
    public async updateUser(@IsInt @PathParam("uid") uid: number,
                            user: NRUser): Promise<NRUser> {
        const currUser = await common.getUser(uid, this.userRepository);

        // Update current stored username if given one.
        if (user.name) {
            currUser.name = user.name;
        }

        // Update current stored first name.
        if (user.firstName) {
            currUser.firstName = user.firstName;
        }

        // Update current stored last name if given one.
        if (user.lastName) {
            currUser.lastName = user.lastName;
        }

        // Update current stored password if given one.
        if (user.password) {
            currUser.password = user.password;
        }

        // TODO: Do roles here?

        return await this.userRepository.save(currUser);
    }

    /**
     * Delete a user.
     *
     * Returns 404 if:
     *      - User id not found.
     */
    @DELETE
    @Path("/:uid")
    public async deleteUser(@IsInt @PathParam("uid") uid: number) {
        const currUser = await common.getUser(uid, this.userRepository);

        await this.userRepository.remove(currUser);
    }

    /**
     * Add a role for a user based on id.
     *
     * Returns 404 if:
     *      - User not found.
     *      - Role not found.
     */
    @PUT
    @Path("/:uid/role/:rid")
    public async addRole(@IsInt @PathParam("uid") uid: number,
                         @IsInt @PathParam("rid") rid: number): Promise<NRUser> {
        const currUser = await common.getUser(uid, this.userRepository);
        const newRole = await common.getRole(rid, this.roleRepository);

        currUser.roles.push(newRole);

        return await this.userRepository.save(currUser);
    }

    /**
     * Get the roles for a user based on id.
     *
     * Returns:
     *      - NRUser
     *      - NotFoundError (404)
     *          - If user not found.
     */
    @GET
    @Path("/:uid/roles")
    public async getRoles(@IsInt @PathParam("uid") uid: number): Promise<NRRole[]> {
        const currUser = await common.getUser(uid, this.userRepository);

        return await currUser.roles;
    }

    /**
     * Delete a role from a users set of roles.
     *
     * Returns:
     *      - NRUser
     *      - NotFoundError (404)
     *          - If user not found.
     *          - If role not found.
     */
    @DELETE
    @Path("/:uid/role/:rid")
    public async deleteRole(@IsInt @PathParam("uid") uid: number,
                            @IsInt @PathParam("rid") rid: number) {
        const currUser = await common.getUser(uid, this.userRepository);
        const currRole = await common.getRole(rid, this.roleRepository);

        const ind = currUser.roles.indexOf(currRole);
        currUser.roles.splice(ind, 1);
        return await this.userRepository.save(currUser);
    }
}
