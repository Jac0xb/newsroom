import { Column, CreateDateColumn, Entity, OneToMany, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NRUser } from "./NRUser";
import { NRPermission } from "./NRPermission";

@Entity("role")
export class NRRole {
    // Primary key.
    @PrimaryGeneratedColumn()
    public id: number;

    // Name of the role.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    // The date of when this user role was created.
    @CreateDateColumn()
    public created: Date;

    // The date of when this user role was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Many: Each role can be assigned to many users.
    // Many: Each user can be assigned to many roles.
    @ManyToMany(
        (type) => NRUser,
        (user) => user.roles
    )
    public users: NRUser[];

    // One: Each permission is only associated with a single role (and page).
    // Many: Each role has permissions for many different pages.
    @OneToMany(
        (type) => NRPermission,
        (permission) => permission.role
    )
    public permissions: NRPermission[];
}
