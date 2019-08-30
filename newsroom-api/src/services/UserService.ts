import * as express from "express";
import { getManager } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

import { NRRole } from "../entity/NRRole";
import { NRUser } from "../entity/NRUser";
import { validators } from "./Validators";

/**
 * Provides API services for users.
 */
@Path("/api/documents")
@Tags("Users")
export class UserService {
    /**
     * Used to interact with any specified type in the database.
     */
    private userRepository = getManager().getRepository(NRUser);
    private roleRepository = getManager().getRepository(NRRole);

    /**
     * Create a new entry in the 'user' table with the specified
     * information.
     *
     * Returns 400 if:
     *      -
     *
     * Returns 404 if:
     *      - Bad parameters.
     */
    @POST
    @PreProcessor(validators.createUserValidator)
    public async createUser(user: NRUser): Promise<NRUser> {
        // Form data already validated above.
        // TODO: Default role?
        return await this.userRepository.save(user);
    }

    /**
     * Get all users that exist in the 'user' table under
     * the configured connection.
     */
    @GET
    public async getUsers(): Promise<NRUser[]> {
        return await this.userRepository.find();
    }

    /**
     * Get a specific user from the 'user' table based on passed
     * user id.
     *
     * Returns 404 if:
     *      - User now found.
     */
    @GET
    @Path(":/id")
    public async getUser(@IsInt @PathParam("id") userId: number): Promise<NRUser> {
        try {
            return await this.userRepository.findOneOrFail(userId);
        } catch (err) {
            console.error("Error getting User:", err);
            throw new NotFoundError("A User with the given ID was not found.");
        }
    }

    /**
     * Update an entry in the 'user' table with the specified
     * information.
     *
     * Return 400 if:
     *      - User property types incorrect.
     *
     * Return 404 if:
     *      - User id field is missing or not found.
     */
    @PUT
    @Path("/:id")
    @PreProcessor(validators.updateUserValidator)
    public async updateUser(@IsInt @PathParam("id") userId: number,
                            user: NRUser): Promise<NRUser> {
        let currUser: NRUser;

        try {
            currUser = await this.userRepository.findOneOrFail(userId);
        } catch (err) {
            console.error("Error getting User:", err);
            throw new NotFoundError("A User with the given ID was not found.");
        }

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
    @Path("/:id")
    public async deleteUser(@IsInt @PathParam("id") userId: number) {
        let currUser: NRUser;

        try {
            currUser = await this.userRepository.findOneOrFail(userId);
        } catch (err) {
            console.error("Error getting User:", err);
            throw new NotFoundError("A User with the given ID was not found.");
        }

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
    @Path("/:id/role/:rid")
    public async addRole(@IsInt @PathParam("id") userId: number,
                         @IsInt @PathParam("rid") roleId: number): Promise<NRUser> {
        let currUser: NRUser;
        let newRole: NRRole;

        try {
            currUser = await this.userRepository.findOneOrFail(userId);
        } catch (err) {
            console.error("Error getting User:", err);
            throw new NotFoundError("A User with the given ID was not found.");
        }

        try {
            newRole = await this.roleRepository.findOneOrFail(roleId);
        } catch (err) {
            console.error("Error getting Role:", err);
            throw new NotFoundError("A Role with the given ID was not found.");
        }

        currUser.roles.push(newRole);

        return await this.userRepository.save(currUser);
    }

    /**
     * Get the role for a user based on id.
     *
     * Returns 404 if:
     *      - User not found.
     */
    @GET
    @Path("/:id/role/:rid")
    public async getRoles(@IsInt @PathParam("id") userId: number): Promise<NRRole[]> {
        let currUser: NRUser;

        try {
            currUser = await this.userRepository.findOneOrFail(userId);
        } catch (err) {
            console.error("Error getting User:", err);
            throw new NotFoundError("A User with the given ID was not found.");
        }

        return await currUser.roles;
    }

    /**
     * Delete a role from a users set of roles.
     *
     * Returns 404 if:
     *      - User not found.
     *      - Role not found.
     */
    @DELETE
    @Path("/:id/role/:rid")
    public async deleteRole(@IsInt @PathParam("id") userId: number,
                            @IsInt @PathParam("rid") roleId: number) {
        let currUser: NRUser;

        try {
            currUser = await this.userRepository.findOneOrFail(userId);
        } catch (err) {
            console.error("Error getting User:", err);
            throw new NotFoundError("A User with the given ID was not found.");
        }

        delete currUser.roles[roleId];
        return await this.userRepository.save(currUser);
    }
}
