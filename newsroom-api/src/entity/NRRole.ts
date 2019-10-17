import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import { NRRole as INRRole } from "../interfaces";

import { DBConstants } from "./DBConstants";
import { NRDCPermission } from "./NRDCPermission";
import { NRSTPermission } from "./NRSTPermission";
import { NRUser } from "./NRUser";
import { NRWFPermission } from "./NRWFPermission";

// NRRole objects group sets of users and tie them to permissions.
@Entity(DBConstants.ROLE_TABLE)
export class NRRole implements INRRole {
    @PrimaryGeneratedColumn()
    public id: number;

    // Plaintext userName of the role.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    @Column({
        nullable: true,
        type: "varchar",
    })
    public description: string;

    @CreateDateColumn()
    public created: Date;

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
     * Relationship: NRDCPermission
     *      - One: Each permission is only associated with a role.
     *      - Many: Each role can have many different permissions.
     */
    @OneToMany(
        (type) => NRDCPermission,
        (permissions) => permissions.role,
    )
    public dcpermissions: NRDCPermission[];

}
