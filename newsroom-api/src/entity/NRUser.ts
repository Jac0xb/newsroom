import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany,
         PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { common } from "../services/Common";
import { NRRole } from "./NRRole";

// NRUser objects are used to track information about any user of the system.
@Entity(common.USER_TABLE)
export class NRUser {
    @PrimaryGeneratedColumn()
    public id: number;

    // Chosen username for the user.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    // First name of the user.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public firstName: string;

    // Last name of the user.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public lastName: string;

    // Plaintext password.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public password: string;

    // Date of when the user was created.
    @CreateDateColumn()
    public created: Date;

    // Date of when the user was last edited.
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
        { eager: true },
    )
    @JoinTable()
    public roles: NRRole[];
}
