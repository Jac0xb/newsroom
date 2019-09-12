import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import { DBConstants } from "./DBConstants";
import { NRRole } from "./NRRole";

// NRUser objects are used to track information about any user of the system.
@Entity(DBConstants.USER_TABLE)
export class NRUser {
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
        {eager: true},
    )
    @JoinTable()
    public roles: NRRole[];
}
