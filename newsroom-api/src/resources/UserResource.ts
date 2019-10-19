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
    NRUser,
    NRWFPermission,
} from "../entity";
import { PermissionService } from "../services/PermissionService";
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

    @Inject()
    private usServ: UserService;

    @Inject()
    private permServ: PermissionService;

    @Inject()
    private rlServ: RoleService;

    @Inject()
    private wfServ: WorkflowService;

    @Context
    private serviceContext: ServiceContext;

    public async configure() {
        const initAdmin = new NRUser();

        if (process.env.ADMIN_EMAIL) {
            console.info("ADMIN_EMAIL=", process.env.ADMIN_EMAIL);

            const u = await this.usRep.findOne( { where: { email: process.env.ADMIN_EMAIL } });
            console.log(u);

            initAdmin.email = process.env.ADMIN_EMAIL;

            const un = initAdmin.email.split("@")[0];

            initAdmin.userName = un;
            initAdmin.firstName = un;
            initAdmin.lastName = un;
            initAdmin.admin = "Y";

            this.usRep.save(initAdmin);
        } else {
            console.error("ERROR: ADMIN_EMAIL IS NOT SET");
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

    /**
     * Get the user who is currently logged in.
     *
     * path:
     *      - None.
     *
     * request:
     *      - None.
     *
     * response:
     *      - NRUser with the following relations:
     *          - None.
     *
     */
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
     * Update a users information
     *
     * path:
     *      - uid: The unique id of the user in question.
     *
     * request:
     *      {
     *          userName: <string>,
     *          firstName: <string>,
     *          lastName: <string>
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
        const updUser = await this.usServ.getUser(uid);

        const usr = await this.serviceContext.user();
        const admin = await this.permServ.isUserAdmin(usr);
        if ((!(admin)) && (usr.id !== updUser.id)) {
            const msg = `Must be an admin or the the user in question to update a user.`;
            throw new Errors.ForbiddenError(msg);
        }

        if (user.userName) {
            updUser.userName = user.userName;
        }

        if (user.firstName) {
            updUser.firstName = user.firstName;
        }

        if (user.lastName) {
            updUser.lastName = user.lastName;
        }

        try {
            return await this.usRep.save(updUser);
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
    public async deleteUser(@IsInt @PathParam("uid") uid: number): Promise<void> {
        const delUsr = await this.usServ.getUser(uid);
        const usr = await this.serviceContext.user();

        const admin = await this.permServ.isUserAdmin(usr);
        if (!(admin)) {
            throw new Errors.ForbiddenError(`Must be an admin to delete other users.`);
        }

        try {
            await this.usRep.remove(delUsr);
            return;
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

        const usr = await this.serviceContext.user();
        const admin = await this.permServ.isUserAdmin(usr);
        if (!(admin)) {
            throw new Errors.ForbiddenError(`Must be an admin to assign roles.`);
        }

        const usdb = await this.usRep.findOne(user.id, {relations: ["roles"]});
        usdb.roles.push(role);

        const rldb = await this.rlRep.findOne(role.id, {relations: ["users"]});
        rldb.users.push(user);

        try {
            await this.rlRep.save(rldb);
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
                            @IsInt @PathParam("rid") rid: number): Promise<NRUser> {
        const user = await this.usServ.getUser(uid);
        const role = await this.rlServ.getRole(rid);

        const usr = await this.serviceContext.user();
        const admin = await this.permServ.isUserAdmin(usr);
        if (!(admin)) {
            throw new Errors.ForbiddenError(`Must be an admin to remove groups.`);
        }

        try {
            if (user.roles === undefined) {
                user.roles = [];
            }

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

        // Individual permissions.
        const usrwp = await this.usRep.findOne(usr.id, {
            relations: ["stpermissions",
                "stpermissions.stage",
                "wfpermissions",
                "wfpermissions.workflow",
                "roles"],
        });

        return usrwp;
    }
}
