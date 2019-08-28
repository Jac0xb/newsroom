import * as express from "express";
import { getManager } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

import { NRUser } from "../entity";
import { validators } from "./Validators";
import { NRUser } from "src/entity/NRUser";
import { NRUser } from "src/entity/NRUser";

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
        // Form data already validated from above.
        return await this.userRepository.save(user);
    }

    /**
     * Get all workflows that exist in the 'user' table under
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
    public async getWorkflow(@IsInt @PathParam("id") userId: number): Promise<NRUser> {
        try {
            return await this.userRepository.findOneOrFail(userId);
        } catch (err) {
            console.error("Error getting User:", err);
            throw new NotFoundError("A User with the given ID was not found.");
        }
    }

    /**
     * Update an entry in th e'user' table with the specified
     * information.
     * 
     * Return 400 if:
     *      - User property types incorrect.
     * 
     * Return 404 if:
     *      - Workflow id field is missing or not found.
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
        if (user.username) {
            currUser.username = user.username;
        }

        // Update current stored password if given one.
        if (user.password) {
            currUser.password = user.password;
        }

        return await this.userRepository.save(currUser);
    }
}