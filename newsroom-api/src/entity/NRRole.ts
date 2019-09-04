import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany,
         PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { NRPermission } from "./NRPermission";
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
     * Relationship: NRPermission
     *      - One: Each permission is only associated with a single role.
     *      - Many: Each role can have many different permissions.
     */
    @OneToMany(
        (type) => NRPermission,
        (permission) => permission.role,
    )
    public permissions: NRPermission[];
}
