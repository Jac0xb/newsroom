import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { DBConstants } from "./DBConstants";
import { NRUser } from "./NRUser";
import { NRWorkflow } from "./NRWorkflow";

import { NRWFUSPermission as INRWFUSPermission } from "./../models";

/**
 * NRWFUSPermission objects track permissions between workflows and users.
 */
@Entity(DBConstants.WFUSPERM_TABLE)
export class NRWFUSPermission implements INRWFUSPermission {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        nullable: false,
        type: "int",
    })
    public access: number;

    /**
     * Relationship: NRWorkflow
     *      - Many: Each workflow has many associated user permissions.
     *      - One: Each user permission is for only one workflow.
     */
    @ManyToOne(
        (type) => NRWorkflow,
        (workflow) => workflow.usrpermissions,
        { onDelete: "CASCADE" },
    )
    public workflow: NRWorkflow;

    /**
     * Relationship: NRUser
     *      - Many: Each user has many associated permissions.
     *      - One: Each permission is for only one user.
     */
    @ManyToOne(
        (type) => NRUser,
        (user) => user.wfpermissions,
        { onDelete: "CASCADE" },
    )
    public user: NRUser;
}
