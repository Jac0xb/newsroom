import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NRRole } from "./NRRole";

@Entity("document")
export class NRPermission {
    // Primary key.
    @PrimaryGeneratedColumn()
    public id: number;

    // Name of the user role.
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

    // Each permission can be associated with many roles.
    @ManyToMany(
        (type) => NRRole,
        (role) => role.permissions
    )
    public roles: NRRole[];
}
