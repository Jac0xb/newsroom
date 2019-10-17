import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { NRWFPermission as INRWFPermission } from "./../models";

import { DBConstants } from "./DBConstants";
import { NRRole } from "./NRRole";
import { NRWorkflow } from "./NRWorkflow";

// NRWFPermission objects track permissions between workflows and roles.
@Entity(DBConstants.WFPERM_TABLE)
export class NRWFPermission implements INRWFPermission {
    @PrimaryGeneratedColumn()
    public id: number;

    // Control READ/WRITE permissions.
    @Column({
        nullable: false,
        type: "int",
    })
    public access: number;

    /**
     * Relationship: NRWorkflow
     *      - Many: Each workflow has many associated roles.
     *      - One: Each permission is for only one workflow.
     */
    @ManyToOne(
        (type) => NRWorkflow,
        (workflow) => workflow.permissions,
        { eager: true, onDelete: "CASCADE" },
    )
    public workflow: NRWorkflow;

    /**
     * Relationship: NRRole
     *      - Many: Each role has many associated permissions.
     *      - One: Each permission is for only one role.
     */
    @ManyToOne(
        (type) => NRRole,
        (role) => role.wfpermissions,
        { eager: true, onDelete: "CASCADE" },
    )
    public role: NRRole;
}
