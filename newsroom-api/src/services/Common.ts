import * as express from "express";
import { Errors } from "typescript-rest";
import { ServiceContext } from "typescript-rest";
import { getManager, Repository } from "typeorm";

import { NRStage, STGE_TABLE } from "../entity/NRStage";
import { NRWorkflow, WRKF_TABLE } from "../entity/NRWorkflow";
import { NRDocument, DOCU_TABLE } from "../entity/NRDocument";
import { NRRole, ROLE_TABLE } from "../entity/NRRole";
import { NRUser, USER_TABLE } from "../entity/NRUser";
import { NRType, TYPE_TABLE } from "../entity/NRType";
import { NRAdmin, ADMIN_TABLE } from "../entity/NRAdmin";

// Common functionality used in different places.
export namespace common {
    // Get the user from the ServiceContext containing the request.
    export function getUserFromContext(context: ServiceContext) {
        return context.request.user; 
    }

    // ?
    export function getTableFromKey(key: number): String {
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

            const err_str = `Workflow with ID ${wid} was not found.`
            throw new Errors.NotFoundError(err_str);
        }
    }

    // Get a stage based on ID.
    export async function getStage(sid: number,
                                   repo: Repository<NRStage>) :Promise<NRStage> {
        try {
            return await repo.findOneOrFail(sid);
        } catch (err) {
            console.error("Error getting stage:", err);

            const err_str = `Stage with ID ${sid} was not found.`
            throw new Errors.NotFoundError(err_str);
        }

    }

    // Determine if the specified user is an admin.
    export async function isAdmin(user: NRUser): Promise<boolean> {
        let userRepo = getManager().getRepository(NRAdmin);

        const isAdmin = await userRepo
            .createQueryBuilder(ADMIN_TABLE)
            .where("admin.user = :id", { id: user.id })
            .getMany()

        if (isAdmin === undefined) {
            return false;
        }

        return true;
    }

    // Return true if the user is an admin, false otherwise.
    export async function checkAdmin(user: NRUser) {
        const admin = await isAdmin(user);

        if (!admin) {
            const err_str = `User ${user.name} does not have the correct permissions.`
            throw new Errors.ForbiddenError(err_str);
        }
    }

    // Determine if a user has the rights to create an item based on key and value.
    export async function checkWritePermissions(user: NRUser, 
                                              key: number) {
        const admin = await isAdmin(user);
        const writePerm = true; // TODO: Actually query this.

        if (!(admin || writePerm)) {
            const err_str = `User ${user.name} does not have the correct permissions.`
            throw new Errors.ForbiddenError(err_str);
        }
    }
}