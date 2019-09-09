import { Repository } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";

import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRRole, NRUser } from "../entity";
import { RoleService } from "../services/RoleService";
import { UserService } from "../services/UserService";
import { createUserValidator, updateUserValidator } from "../validators/UserValidators";

// Provides API services for users.
@Service()
@Path("/api/users")
@Tags("Users")
export class UserResource {
    // Database interactions managers.
    @InjectRepository(NRRole)
    private roleRepository: Repository<NRRole>; // = getManager().getRepository(NRRole);

    @InjectRepository(NRUser)
    private userRepository: Repository<NRUser>; // getManager().getRepository(NRUser);

    @Inject()
    private userService: UserService;

    @Inject()
    private roleService: RoleService;

    /**
     * Create a new user.
     *
     * Returns:
     *      - NRUser
     *      - BadRequestError (400)
     *          - If properties are missing or wrong type.
     */
    @POST
    @PreProcessor(createUserValidator)
    public async createUser(user: NRUser): Promise<NRUser> {
        try {
            // Form data already validated above.
            return await this.userRepository.save(user);
        } catch (err) {
            console.log(err);

            const errStr = `Error creating user.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all existent users.
     *
     * Returns:
     *      - NRUser[]
     */
    @GET
    public async getUsers(): Promise<NRUser[]> {
        try {
            return await this.userRepository.find();
        } catch (err) {
            console.log(err);

            const errStr = `Error getting users.`;
            throw new Errors.InternalServerError(errStr);
        }
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
    @Path("/:uid")
    public async getUser(@PathParam("uid") uid: number): Promise<NRUser> {
        return await this.userService.getUser(uid);
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
    @PreProcessor(updateUserValidator)
    public async updateUser(@IsInt @PathParam("uid") uid: number,
                            user: NRUser): Promise<NRUser> {
        const currUser = await this.userService.getUser(uid);

        // Update current stored username if given one.
        if (user.userName) {
            currUser.userName = user.userName;
        }

        if (user.email) {
            currUser.email = user.email;
        }

        // Update current stored first userName.
        if (user.firstName) {
            currUser.firstName = user.firstName;
        }

        // Update current stored last userName if given one.
        if (user.lastName) {
            currUser.lastName = user.lastName;
        }

        try {
            return await this.userRepository.save(currUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error updating user.`;
            throw new Errors.InternalServerError(errStr);
        }
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
        const currUser = await this.userService.getUser(uid);

        try {
            await this.userRepository.remove(currUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error deleting user.`;
            throw new Errors.InternalServerError(errStr);
        }
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
        const currUser = await this.userService.getUser(uid);
        const newRole = await this.roleService.getRole(rid);

        currUser.roles.push(newRole);

        try {
            return await this.userRepository.save(currUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error adding role for user.`;
            throw new Errors.InternalServerError(errStr);
        }
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
        const currUser = await this.userService.getUser(uid);

        try {
            return await currUser.roles;
        } catch (err) {
            console.log(err);

            const errStr = `Error getting roles for user.`;
            throw new Errors.InternalServerError(errStr);
        }
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
    public async removeRole(@IsInt @PathParam("uid") uid: number,
                            @IsInt @PathParam("rid") rid: number) {
        const currUser = await this.userService.getUser(uid);
        const currRole = await this.roleService.getRole(rid);

        try {
            const ind = currUser.roles.indexOf(currRole);
            currUser.roles.splice(ind, 1);
            return await this.userRepository.save(currUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error removing role from user.`;
            throw new Errors.InternalServerError(errStr);
        }
    }
}
