import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany,
         PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { NRWFPermission } from "./NRWFPermission";
import { NRSTPermission } from "./NRSTPermission";
import { NRDCPermission } from "./NRDCPermission";
import { NRUser } from "./NRUser";

export const ROLE_TABLE = "role";

// NRRole objects group sets of users and tie them to permissions.
@Entity(ROLE_TABLE)
export class NRRole {
    @PrimaryGeneratedColumn()
    public id: number;

    // Name of the role.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    // The date of when this role was created.
    @CreateDateColumn()
    public created: Date;

    // The date of when this role was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    /**
     * Relationship: NRUser
     *      - Many: Each role can be assigned to many users.
     *      - Many: Each user can be assigned to many roles.
     */
    @ManyToMany(
        (type) => NRUser,
        (user) => user.roles,
    )
    public users: NRUser[];

    /**
     * Relationship: NRWFPermission
     *      - One: Each permission is only associated with a role.
     *      - Many: Each role can have many different permissions.
     */
    @OneToMany(
        (type) => NRWFPermission,
        (permissions) => permissions.role,
    )
    public wfpermissions: NRWFPermission[];

    /**
     * Relationship: NRSTPermission
     *      - One: Each permission is only associated with a role.
     *      - Many: Each role can have many different permissions.
     */
    @OneToMany(
        (type) => NRSTPermission,
        (permissions) => permissions.role,
    )
    public stpermissions: NRSTPermission[];

/**
     * Relationship: NRWFPermission
     *      - One: Each permission is only associated with a role.
     *      - Many: Each role can have many different permissions.
     */
    @OneToMany(
        (type) => NRDCPermission,
        (permissions) => permissions.role,
    )
    public dcpermissions: NRDCPermission[];


}
