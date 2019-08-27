import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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

    // Each role can have many associated users.
    @ManyToMany(
        (type) => NRUser,
        (user) => user.roles
    )
    public users: NRUser[];

    // Each role can have many associated permissions.
    @ManyToMany(
        (type) => NRPermission,
        (permission) => permission.roles
    )
    public permissions: NRPermission[];
}
