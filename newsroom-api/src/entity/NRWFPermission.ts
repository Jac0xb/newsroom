import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { NRWorkflow } from "./NRWorkflow";
import { NRRole } from "./NRRole";

// NRWFPermission objects track permissions between workflows and roles.
@Entity("wfpermission")
export class NRWFPermission {
    public static READ = 0;
    public static WRITE = 1;

    @PrimaryGeneratedColumn()
    public id: number;

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
        { eager: true },
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
        { eager: true },
    )
    public role: NRRole;
}
