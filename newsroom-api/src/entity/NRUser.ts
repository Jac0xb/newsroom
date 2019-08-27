import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NRRole } from "./NRRole";

@Entity("user")
export class NRUser {
    // Primary key.
    @PrimaryGeneratedColumn()
    public id: number;

    // Username for the website.
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
    public password: string; // TODO: Actual auth?

    // The date of when user was created.
    @CreateDateColumn()
    public created: Date;

    // The date of when user was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Each user can have many associated roles.
    @ManyToMany(
        (type) => NRRole,
        (role) => role.users
    )
    @JoinTable()
    public roles: NRRole[];
}
