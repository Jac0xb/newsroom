import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
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
import {
    NRRole,
    NRSTPermission,
    NRSTUSPermission,
    NRUser,
    NRUserSummary,
    NRWFPermission,
    NRWFUSPermission,
} from "../entity";
import { RoleService } from "../services/RoleService";
import { UserService } from "../services/UserService";
import { WorkflowService } from "../services/WorkflowService";
import { createUserValidator, updateUserValidator } from "../validators/UserValidators";

// Provides API services for users.
@Service()
@Path("/api/users")
@Tags("Users")
export class UserResource {
    @InjectRepository(NRRole)
    private rlRep: Repository<NRRole>;

    @InjectRepository(NRUser)
    private usRep: Repository<NRUser>;

    @InjectRepository(NRWFPermission)
    private wfPRep: Repository<NRWFPermission>;

    @InjectRepository(NRSTPermission)
    private stPRep: Repository<NRSTPermission>;

    @InjectRepository(NRWFUSPermission)
    private wfUSRep: Repository<NRWFUSPermission>;

    @InjectRepository(NRSTUSPermission)
    private stUSRep: Repository<NRSTUSPermission>;

    @Inject()
    private usServ: UserService;

    @Inject()
    private rlServ: RoleService;

    @Inject()
    private wfServ: WorkflowService;

    @Context
    private serviceContext: ServiceContext;

    /**
     * Create a new user.
     *
     * path:
     *      - None.
     *
     * request:
     *      {
     *          userName: <string>,
     *          firstName: <string>,
     *          lastName: <string>,
     *          email: <string>
     *      }
     *          - None of the above can be missing.
     *          - 'userName' must be unique.
     *
     * response:
     *      - NRUser with the following relations:
     *          - None.
     *      - BadRequestError (400)
     *          - If properties are missing or wrong type.
     *      - InternalServerError (500)
     *          - If something went wrong.
     */
    @POST
    @PreProcessor(createUserValidator)
    public async createUser(user: NRUser): Promise<NRUser> {
        try {
            return await this.usRep.save(user);
        } catch (err) {
            console.log(err);

            const errStr = `Error creating user.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get all existent users.
     *
     * path:
     *      - None.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRUser[] with the following relations:
     *          - None.
     *      - InternalServerError (500)
     *          - If something went wrong.
     */
    @GET
    public async getUsers(): Promise<NRUser[]> {
        try {
            return await this.usRep.find();
        } catch (err) {
            console.log(err);

            const errStr = `Error getting users.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    @GET
    @Path("/current")
    public async getCurrentUser(): Promise<NRUser> {
        return this.serviceContext.user();
    }

    /**
     * Get a specific user by ID.
     *
     * path:
     *      - uid: The unique id of the user in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRUser with the following relations:
     *          - None.
     *      - NotFoundError (404)
     *          - If user not found.
     *      - InternalServerError (500)
     *          - If something went wrong.
     */
    @GET
    @Path("/:uid")
    public async getUser(@PathParam("uid") uid: number): Promise<NRUser> {
        return await this.usServ.getUser(uid);
    }

    /**
     * TODO: How does this interact with oauth? Seems like this would cause problems. Maybe if updated
     *       we just automatically log the user out?
     *
     * Update a users information
     *
     * path:
     *      - uid: The unique id of the user in question.
     *
     * request:
     *      {
     *          userName: <string>,
     *          firstName: <string>,
     *          lastName: <string>,
     *          email: <string>
     *      }
     *          - None of the above is required, but will be updated if passed.
     *          - 'userName' must be unique.
     *
     * Returns:
     *      - NRUser
     *      - BadRequestError (400)
     *          - If form submission invalid.
     *      - NotFoundError (404)
     *          - If user not found.
     *      - InternalServerError (500)
     *          - If something went wrong.
     */
    @PUT
    @Path("/:uid")
    @PreProcessor(updateUserValidator)
    public async updateUser(@IsInt @PathParam("uid") uid: number,
                            user: NRUser): Promise<NRUser> {
        const currUser = await this.usServ.getUser(uid);

        if (user.userName) {
            currUser.userName = user.userName;
        }

        if (user.email) {
            currUser.email = user.email;
        }

        if (user.firstName) {
            currUser.firstName = user.firstName;
        }

        if (user.lastName) {
            currUser.lastName = user.lastName;
        }

        try {
            return await this.usRep.save(currUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error updating user.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete a user.
     *
     * path:
     *      - uid: The unique id of the user in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NoContent (204)
     *          - On success.
     *      - NotFounderror (404)
     *          - If user not found.
     *      - InternalServerError (500)
     *          - If something went wrong.
     */
    @DELETE
    @Path("/:uid")
    public async deleteUser(@IsInt @PathParam("uid") uid: number) {
        const currUser = await this.usServ.getUser(uid);

        try {
            await this.usRep.remove(currUser);
        } catch (err) {
            console.log(err);

            const errStr = `Error deleting user.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Add a role for a user based on id.
     *
     * path:
     *      - uid: The unique id of the user in question.
     *      - rid: The unique id of the role to add them to.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRUser with the following relations:
     *          - roles: An array of the roles they are currently a part of.
     *      - NotFoundError (404)
     *          - User or role not found.
     */
    @PUT
    @Path("/:uid/role/:rid")
    public async addRole(@IsInt @PathParam("uid") uid: number,
                         @IsInt @PathParam("rid") rid: number): Promise<NRUser> {
        const user = await this.usServ.getUser(uid);
        const role = await this.rlServ.getRole(rid);

        const usdb = await this.usRep.findOne(user.id, {relations: ["roles"]});
        usdb.roles.push(role);

        try {
            return await this.usRep.save(usdb);
        } catch (err) {
            console.log(err);

            const errStr = `Error adding role for user.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Get the roles for a user based on id.
     *
     * path:
     *      - uid: The unique id of the use rin question.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRUser with the following relations:
     *      - NotFoundError (404)
     *          - If user not found.
     */
    @GET
    @Path("/:uid/roles")
    public async getRoles(@IsInt @PathParam("uid") uid: number): Promise<NRRole[]> {
        const user = await this.usServ.getUser(uid);
        const ur = await this.usRep.findOne(user.id, {relations: ["roles"]});

        try {
            return ur.roles;
        } catch (err) {
            console.log(err);

            const errStr = `Error getting roles for user.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Delete a role from a users set of roles.
     *
     * path:
     *      - uid: The unique id of the user in question.
     *      - rid: The unique id of the role the user should be removed from.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRUser with the following relations:
     *          - roles: An array of all roles the user is a part of.
     *      - NotFoundError (404)
     *          - If user or role not found.
     */
    @DELETE
    @Path("/:uid/role/:rid")
    public async removeRole(@IsInt @PathParam("uid") uid: number,
                            @IsInt @PathParam("rid") rid: number) {
        const user = await this.usServ.getUser(uid);
        const role = await this.rlServ.getRole(rid);

        try {
            const ind = user.roles.indexOf(role);
            user.roles.splice(ind, 1);

            return await this.usRep.save(user);
        } catch (err) {
            console.log(err);

            const errStr = `Error removing role from user.`;
            throw new Errors.InternalServerError(errStr);
        }
    }

    /**
     * Give the specified user an individual permission on a workflow.
     * Note that this will change if it exists, otherwise it will create it.
     *
     * path:
     *      - uid: The unique id of the user to give the permission to.
     *      - wid: The unique id of the workflow to give permissions to.
     *      - perm: 1 for WRITE, 0 for READ.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRWFUSPermission with the following relations:
     *          - None.
     */
    @PUT
    @Path("/:uid/wfperm/:wid/:perm")
    public async addWFPerm(@IsInt @PathParam("uid") uid: number,
                           @IsInt @PathParam("wid") wid: number,
                           @IsInt @PathParam("perm") permission: number): Promise<NRWFUSPermission> {
        const usr = await this.usServ.getUser(uid);
        const wf = await this.wfServ.getWorkflow(wid);

        const wfup = await this.wfUSRep.findOne({
            where: {
                user: usr,
                workflow: wf,
            },
        });

        if (wfup === undefined) {
            return await this.wfServ.createWFUSPermission(wid, usr, permission);
        } else {
            wfup.access = permission;
            return await this.wfUSRep.save(wfup);
        }
    }

    /**
     * Give the specified user an individual permission on a stage.
     * Note that this will change if it exists, otherwise it will create it.
     *
     * path:
     *      - uid: The unique id of the user to give the permission to.
     *      - sid: The unique id of the stage to give permissions to.
     *      - perm: 1 for WRITE, 0 for READ.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRSTUSPermission with the following relations:
     *          - None.
     */
    @PUT
    @Path("/:uid/stperm/:sid/:perm")
    public async addSTPerm(@IsInt @PathParam("uid") uid: number,
                           @IsInt @PathParam("sid") sid: number,
                           @IsInt @PathParam("perm") permission: number): Promise<NRSTUSPermission> {
        const usr = await this.usServ.getUser(uid);
        const st = await this.wfServ.getStage(sid);

        const stup = await this.stUSRep.findOne({
            where: {
                stage: st,
                user: usr,
            },
        });

        if (stup === undefined) {
            return await this.wfServ.createSTUSPermission(sid, usr, permission);
        } else {
            stup.access = permission;
            return await this.stUSRep.save(stup);
        }
    }

    /**
     * Provide a summary of a user and their associated permissions.
     *
     * path:
     *      - The unique id of the user in question.
     *
     * request:
     *      - None.
     *
     * response:
     *      -
     */
    @GET
    @Path("/:uid/summary")
    public async getUserSummary(@IsInt @PathParam("uid") uid: number): Promise<NRUser> {
        const usr = await this.usServ.getUser(uid);

        const usum = new NRUserSummary();

        // Individual permissions.
        const usrwp = await this.usRep.findOne(usr.id, {
            relations: ["stpermissions",
                "stpermissions.stage",
                "wfpermissions",
                "wfpermissions.workflow",
                "roles"],
        });

        return usrwp;

        // for (const stus of usrwp.stpermissions) {
        //     if (stus.access === DBConstants.WRITE) {
        //         usum.userWriteStages.add(stus.stage);
        //     } else {
        //         usum.userReadStages.add(stus.stage);
        //     }
        // }

        // for (const wfus of usrwp.wfpermissions) {
        //     if (wfus.access === DBConstants.WRITE) {
        //         usum.userWriteWorkflows.add(wfus.workflow);
        //     } else {
        //         usum.userReadWorkflows.add(wfus.workflow);
        //     }
        // }

        // // Group permissions.
        // const uwrs = await this.usRep.findOne(usr.id, { relations: ["roles"] });

        // for (const rl of uwrs.roles) {
        //     const rlwp = await this.rlRep.findOne(rl.id, { relations: ["wfpermissions",
        //                                                                "wfpermissions.workflow",
        //                                                                "stpermissions",
        //                                                                "stpermissions.stage"]});
        //     for (const wfp of rlwp.wfpermissions) {
        //         if (wfp.access === DBConstants.WRITE) {
        //             usum.groupWriteWorkflows.add(wfp.workflow);
        //         } else {
        //             usum.groupReadWorkflows.add(wfp.workflow);
        //         }
        //     }

        //     for (const stp of rlwp.stpermissions) {
        //         if (stp.access === DBConstants.WRITE) {
        //             usum.groupWriteStages.add(stp.stage);
        //         } else {
        //             usum.groupReadStages.add(stp.stage);
        //         }
        //     }
        // }

        // usum.groups = uwrs.roles;

        // return usum;
    }
}
