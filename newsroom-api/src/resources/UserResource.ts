import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NRRole, NRUser, NRWFUSPermission, NRSTUSPermission } from "../entity";
import { RoleService } from "../services/RoleService";
import { UserService } from "../services/UserService";
import { createUserValidator, updateUserValidator } from "../validators/UserValidators";
import { WorkflowService } from "../services/WorkflowService";

// Provides API services for users.
@Service()
@Path("/api/users")
@Tags("Users")
export class UserResource {
    @InjectRepository(NRRole)
    private roleRepository: Repository<NRRole>;

    @InjectRepository(NRUser)
    private userRepository: Repository<NRUser>;

    @InjectRepository(NRWFUSPermission)
    private wfUSRepository: Repository<NRWFUSPermission>;

    @InjectRepository(NRSTUSPermission)
    private stUSRepository: Repository<NRSTUSPermission>;

    @Inject()
    private userService: UserService;

    @Inject()
    private roleService: RoleService;

    @Inject()
    private workflowService: WorkflowService;


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
        const user = await this.userService.getUser(uid);
        const role = await this.roleService.getRole(rid);

        const usdb = await this.userRepository.findOne(user.id, { relations: ['roles']});
        usdb.roles.push(role);

        try {
            return await this.userRepository.save(usdb);
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

    @PUT
    @Path("/:uid/wfperm/:wid/:perm")
    public async addWFPerm(@IsInt @PathParam("uid") uid: number,
                           @IsInt @PathParam("wid") wid: number,
                           @IsInt @PathParam("perm") permission: number): Promise<NRWFUSPermission> {
        const user = await this.userService.getUser(uid);
        const wf = await this.workflowService.getWorkflow(wid);

        const wfup = await this.wfUSRepository.findOne({ where: { 'workflow': wf,
                                                                  'user': user}})
        
        if (wfup === undefined) {
            return await this.workflowService.createWFUSPermission(wid, user, permission);
        } else {
            wfup.access = permission;
            return await this.wfUSRepository.save(wfup);
        }
    }

    @PUT
    @Path("/:uid/stperm/:sid/:perm")
    public async addSTPerm(@IsInt @PathParam("uid") uid: number,
                           @IsInt @PathParam("sid") sid: number,
                           @IsInt @PathParam("perm") permission: number): Promise<NRSTUSPermission> {
        const user = await this.userService.getUser(uid);
        const st = await this.workflowService.getStage(sid);

        const stup = await this.stUSRepository.findOne({ where: {'stage': st,
                                                                 'user': user}})

        if (stup === undefined) {
            return await this.workflowService.createSTUSPermission(sid, user, permission);
        } else {
            stup.access = permission;
            return await this.stUSRepository.save(stup);
        }
    }
}
