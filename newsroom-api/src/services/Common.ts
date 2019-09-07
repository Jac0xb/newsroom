import { getManager, Repository } from "typeorm";
import { Errors, ServiceContext } from "typescript-rest";

import {
    NRDCPermission,
    NRDocument,
    NRRole,
    NRStage,
    NRSTPermission,
    NRUser,
    NRWFPermission,
    NRWorkflow,
} from "../entity";

// Common functionality used in different places.
export namespace common {
    export const READ = 0;
    export const WRITE = 1;
    export const USER_TABLE = "user";
    export const STGE_TABLE = "stage";
    export const ROLE_TABLE = "role";
    export const DOCU_TABLE = "document";
    export const WRKF_TABLE = "workflow";
    export const WFPERM_TABLE = "wfpermission";
    export const STPERM_TABLE = "stpermission";
    export const DCPERM_TABLE = "dcpermission";

    // Get the user from the ServiceContext containing the request.
    export function getUserFromContext(context: ServiceContext) {
        return context.request.user;
    }

    // Get a workflow based on ID.
    export async function getWorkflow(wid: number,
                                      repo: Repository<NRWorkflow>): Promise<NRWorkflow> {
        try {
            return await repo.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting workflow:", err);

            const errStr = `Workflow with ID ${wid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a stage based on ID.
    export async function getStage(sid: number,
                                   repo: Repository<NRStage>): Promise<NRStage> {
        try {
            return await repo.findOneOrFail(sid);
        } catch (err) {
            console.error("Error getting stage:", err);

            const errStr = `Stage with ID ${sid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }

    }

    // Get a document based on ID.
    export async function getDocument(did: number,
                                      repo: Repository<NRDocument>): Promise<NRDocument> {
        try {
            return await repo.findOneOrFail(did);
        } catch (err) {
            console.error("Error getting document:", err);

            const errStr = `Document with ID ${did} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a role based on ID.
    export async function getRole(rid: number,
                                  repo: Repository<NRRole>): Promise<NRRole> {
        try {
            return await repo.findOneOrFail(rid);
        } catch (err) {
            console.error("Error getting role:", err);

            const errStr = `Role with ID ${rid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a workflow permission based on ID.
    export async function getWFPermission(pid: number,
                                          repo: Repository<NRWFPermission>): Promise<NRWFPermission> {
        try {
            return await repo.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting WF permission:", err);

            const errStr = `WF permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a stage permission based on ID.
    export async function getSTPermission(pid: number,
                                          repo: Repository<NRSTPermission>): Promise<NRSTPermission> {
        try {
            return await repo.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting ST permission:", err);

            const errStr = `ST permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a document permission based on ID.
    export async function getDCPermission(pid: number,
                                          repo: Repository<NRDCPermission>): Promise<NRDCPermission> {
        try {
            return await repo.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting DC permission:", err);

            const errStr = `DC permission with ID ${pid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Get a user based on ID.
    export async function getUser(uid: number,
                                  repo: Repository<NRUser>): Promise<NRUser> {
        try {
            return await repo.findOneOrFail(uid);
        } catch (err) {
            console.error("Error getting user:", err);

            const errStr = `User with ID ${uid} was not found.`;
            throw new Errors.NotFoundError(errStr);
        }
    }

    // Check if a user has write permissions on a workflow.
    export async function checkWFWritePermissions(user: NRUser,
                                                  wid: number,
                                                  repo: Repository<NRWFPermission>) {
        let allowed = false;

        const userRepo = getManager().getRepository(NRUser);
        user = await getUser(user.id, userRepo);

        try {
            if (!((user.roles === undefined) || (user.roles.length === 0))) {
                for (const role of user.roles) {
                    const roleRight = await repo
                        .createQueryBuilder(common.WFPERM_TABLE)
                        .select(`MAX(${common.WFPERM_TABLE}.access)`, "max")
                        .where(`${common.WFPERM_TABLE}.roleId = :id`, {id: role.id})
                        .andWhere(`${common.WFPERM_TABLE}.workflowId = :wfid`, {wfid: wid})
                        .getRawOne();

                    if (roleRight.max === common.WRITE) {
                        allowed = true;
                        break;
                    }
                }
            }
        } catch (err) {
            console.log(err);

            const errStr = `Error checking WF permissions.`;
            throw new Errors.InternalServerError(errStr);
        }

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have WF write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Check if a user has write permissions on a stage.
    export async function checkSTWritePermissions(user: NRUser,
                                                  sid: number,
                                                  repo: Repository<NRSTPermission>) {
        let allowed = false;

        const userRepo = getManager().getRepository(NRUser);
        user = await getUser(user.id, userRepo);

        for (const role of user.roles) {
            const roleRight = await repo
                .createQueryBuilder(common.STPERM_TABLE)
                .select(`MAX(${common.STPERM_TABLE}.access)`, "max")
                .where(`${common.STPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${common.STPERM_TABLE}.stageId = :stid`, {stid: sid})
                .getRawOne();

            if (roleRight.max === common.WRITE) {
                allowed = true;
                break;
            }
        }

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have ST write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Check if a user has write permissions on a document.
    export async function checkDCWritePermissions(user: NRUser,
                                                  did: number,
                                                  repo: Repository<NRDCPermission>) {
        let allowed = false;

        const userRepo = getManager().getRepository(NRUser);
        user = await getUser(user.id, userRepo);

        for (const role of user.roles) {
            const roleRight = await repo
                .createQueryBuilder(common.DCPERM_TABLE)
                .select(`MAX(${common.DCPERM_TABLE}.access)`, "max")
                .where(`${common.DCPERM_TABLE}.roleId = :id`, {id: role.id})
                .andWhere(`${common.DCPERM_TABLE}.documentId = :dcid`, {dcid: did})
                .getRawOne();

            if (roleRight.max === common.WRITE) {
                allowed = true;
                break;
            }
        }

        if (!(allowed)) {
            const errStr = `User with ID ${user.id} does not have DC write permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }
}
