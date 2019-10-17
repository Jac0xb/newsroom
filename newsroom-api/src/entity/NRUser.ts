import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany,
         PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { DBConstants } from "./DBConstants";
import { NRDCUSPermission } from "./NRDCUSPermission";
import { NRRole } from "./NRRole";
import { NRSTUSPermission } from "./NRSTUSPermission";
import { NRWFUSPermission } from "./NRWFUSPermission";

import { NRUser as INRUser } from "./../models";

/**
 * NRUser objects are used to track information about any user of the system.
 */
@Entity(DBConstants.USER_TABLE)
export class NRUser implements INRUser {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public userName: string;

    @Column({
        length: 500,
        nullable: false,
        type: "varchar",
    })
    public email: string;

    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public firstName: string;

    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public lastName: string;

    @Column({
        nullable: true,
        type: "varchar",
    })
    public accessToken: string;

    @CreateDateColumn()
    public created: Date;

    @UpdateDateColumn()
    public lastUpdated: Date;

    /**
     * Relationship: NRRole
     *      - Many: Each user can have many associated roles.
     *      - Many: Each role can be assigned to many users.
     */
    @ManyToMany(
        (type) => NRRole,
        (role) => role.users,
    )
    @JoinTable()
    public roles: NRRole[];

    /**
     * Relationship: NRWFUSPermission
     *      - One: Each permission is only associated with a user.
     *      - Many: Each user can have many different permissions.
     */
    @OneToMany(
        (type) => NRWFUSPermission,
        (permissions) => permissions.user,
    )
    public wfpermissions: NRWFUSPermission[];

    /**
     * Relationship: NRSTUSPermission
     *      - One: Each permission is only associated with a user.
     *      - Many: Each user can have many different permissions.
     */
    @OneToMany(
        (type) => NRSTUSPermission,
        (permissions) => permissions.user,
    )
    public stpermissions: NRSTUSPermission[];

    /**
     * Relationship: NRDCUSPermission
     *      - One: Each permission is only associated with a user.
     *      - Many: Each user can have many different permissions.
     */
    @OneToMany(
        (type) => NRDCUSPermission,
        (permissions) => permissions.user,
    )
    public dcpermissions: NRDCUSPermission[];
}
