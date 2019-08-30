import * as express from "express";
import { getManager } from "typeorm";
import { DELETE, Errors, GET, Path, PathParam, POST, PreProcessor, PUT } from "typescript-rest";
import { IsInt, Tags } from "typescript-rest-swagger";
import { NotFoundError } from "typescript-rest/dist/server/model/errors";

import { NRDocument } from "../entity/NRDocument";
import { NRStage } from "../entity/NRStage";
import { NRWorkflow } from "../entity/NRWorkflow";
import { NRPermission } from "../entity/NRPermission";
import { NRRole } from "../entity/NRRole";
import { NRUser } from "../entity/NRUser";
import { validators } from "./Validators";

// Provides API services for determining permissions.
@Path("/api/permissions")
@Tags("Permissions")
export class PermissionService {
    // Database interaction managers.
    private userRepository = getManager().getRepository(NRUser);
    private permRepository = getManager().getRepository(NRPermission);
    private workflowRepository = getManager().getRepository(NRWorkflow);
    private roleRepository = getManager().getRepository(NRRole);

    // Change the permission given a role id, workflow id, and a permission.
    public async assignPermission(wid: number, rid: number, give: number): Promise<NRWorkflow> {
        let workflow: NRWorkflow;
        let role: NRRole;

        try {
            workflow = await this.workflowRepository.findOneOrFail(wid);
        } catch (err) {
            console.error("Error getting workflow:", err);
            throw new NotFoundError("A workflow with the given id was not found.");
        }

        try {
            role = await this.roleRepository.findOneOrFail(rid);
        } catch (err) {
            console.error("Error getting role:", err);
            throw new NotFoundError("A role with the given id was not found.");
        }

        // See if permissions already exists.
        const result = await this.permRepository
            .createQueryBuilder("permission")
            .where("foreign_id = :wfid", { wfid: wid })
            .andWhere("foreign_type = workflow")
            .andWhere("roldId = :roid", { roid: rid })
            .getOne();

        // Nothing exists yet, create it.
        if (result === undefined) {
            // const newPerm:NRPermission = {
            //     foreignType: "workflow",

            // }
            // newPerm.foreignType = "workflow";
            // newPerm.foreignId = wid;
            // newPerm.access = give;
            // await this.permRepository.save(newPerm);

            // // Don't need await, but yolo.
            // return await workflow;
        } else { // Something exists, update it.
            const perm = await this.permRepository
            .createQueryBuilder("permission")
            .where("foreign_id = :wfid", { wfid: wid })
            .andWhere("foreign_type = workflow")
            .andWhere("roldId = :roid", { roid: rid })
            .getOne();

            perm.access = give;
            await this.permRepository.save(perm);

            // Don't need await, but yolo.
            return await workflow;
        }
    }
}
