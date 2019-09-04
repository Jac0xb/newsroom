import * as express from "express";
import { getManager, Repository } from "typeorm";
import { Errors } from "typescript-rest";
import { ServiceContext } from "typescript-rest";

import { ADMIN_TABLE, NRAdmin } from "../entity/NRAdmin";
import { DOCU_TABLE, NRDocument } from "../entity/NRDocument";
import { NRPermission } from "../entity/NRPermission";
import { NRRole, ROLE_TABLE } from "../entity/NRRole";
import { NRStage, STGE_TABLE } from "../entity/NRStage";
import { NRType, TYPE_TABLE } from "../entity/NRType";
import { NRUser, USER_TABLE } from "../entity/NRUser";
import { NRWorkflow, WRKF_TABLE } from "../entity/NRWorkflow";

// Common functionality used in different places.
export namespace common {
    // Get the user from the ServiceContext containing the request.
    export function getUserFromContext(context: ServiceContext) {
        return context.request.user;
    }

    // ?
    export function getTableFromKey(key: number): string {
        if (key === NRType.USER_KEY) {
            return USER_TABLE;
        }
        if (key === NRType.STGE_KEY) {
            return STGE_TABLE;
        }
        if (key === NRType.WRKF_KEY) {
            return WRKF_TABLE;
        }
        if (key === NRType.DOCU_KEY) {
            return DOCU_TABLE;
        }
        if (key === NRType.ROLE_KEY) {
            return ROLE_TABLE;
        }
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

    // Get a permission based on ID.
    export async function getPermission(pid: number,
                                        repo: Repository<NRPermission>): Promise<NRPermission> {
        try {
            return await repo.findOneOrFail(pid);
        } catch (err) {
            console.error("Error getting permission:", err);

            const errStr = `Permission with ID ${pid} was not found.`;
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

    // Determine if the specified user is an admin.
    export async function isAdmin(user: NRUser): Promise<boolean> {
        const userRepo = getManager().getRepository(NRAdmin);

        const admin = await userRepo
            .createQueryBuilder(ADMIN_TABLE)
            .where("admin.user = :id", { id: user.id })
            .getMany();

        if (admin === undefined) {
            return false;
        }

        return true;
    }

    // Return true if the user is an admin, false otherwise.
    export async function checkAdmin(user: NRUser) {
        const admin = await isAdmin(user);

        if (!admin) {
            const errStr = `User ${user.name} does not have the correct permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Determine if a user has the rights to create an item based on key and value.
    export async function checkWritePermissions(user: NRUser,
                                                key: number,
                                                val: number) {
        const admin = await isAdmin(user);
        const writePerm = true; // TODO: Actually query this.

        if (!(admin || writePerm)) {
            const errStr = `User ${user.name} does not have the correct permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Determine if a user is allowed to create an item based on key type.
    export async function checkCreatePermissions(user: NRUser,
                                                 key: number) {
        const admin = await isAdmin(user);
        const createPerm = true; // TODO: Actually query this.

        if (!(admin || createPerm)) {
            const errStr = `User ${user.name} does not have the correct permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Determine if a user is allowed to move a document forward a stage.
    export async function checkMoveNext(user: NRUser,
                                        key: number,
                                        val: number) {
        const admin = await isAdmin(user);
        const moveNextPerm = true;

        if (!(admin || moveNextPerm)) {
            const errStr = `User ${user.name} does not have the correct permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

    // Determine if a user is allowed to move a document backward a stage.
    export async function checkMovePrev(user: NRUser,
                                        key: number,
                                        val: number) {
        const admin = await isAdmin(user);
        const movePrevPerm = true;

        if (!(admin || movePrevPerm)) {
            const errStr = `User ${user.name} does not have the correct permissions.`;
            throw new Errors.ForbiddenError(errStr);
        }
    }

}
