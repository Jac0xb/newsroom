import { CreateDateColumn, Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NRRole } from "./NRRole";
import { NRWorkflow } from "./NRWorkflow";

@Entity("permission")
export class NRPermission {
    // Primary key.
    @PrimaryGeneratedColumn()
    public id: number;

    // What privilege the role has on the associated entity.
    // 1: Write
    // 0: Read
    // So queries for all roles given to a user can just use
    // MAX(), and know permissions based on the return value.
    @Column({
        nullable: false,
        type: "int"
    })
    public name: string;

    // The date of when this user permission was created.
    @CreateDateColumn()
    public created: Date;

    // The date of when this user permission was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Many: Each role has many associated permissions.
    // One: Each permission as a tuple of:
    //          (role_id, entity_id)
    //      is only associated with one permission.
    //      This allows roles to have permissions for each
    //      different entity.
    @ManyToOne(
        (type) => NRRole,
        (role) => role.permissions,
        { eager: true },
    )
    public role: NRRole;

    // Many: Each workflow has many different permissions.
    // One:  Each permission tuple of:
    //          (role_id, workflow_id)
    //      is only associated with one permission, hence
    //      each workflow can have different permissions.
    @ManyToOne(
        (type) => NRWorkflow,
        (workflow) => workflow.permissions,
    )
    public workflow: NRWorkflow;

}
