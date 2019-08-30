import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";

import { NRUser } from "./NRUser";


export const ADMIN_TABLE = "admin"

// NRAdmin objects determine whether or not users are administrators.
@Entity(ADMIN_TABLE)
export class NRAdmin {
    public static NO = 0;
    public static YES = 1;

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        nullable: false,
        type: "int"
    })
    public flag: number;

    @ManyToOne(
        (type) => NRUser
    )
    @JoinColumn({name: "user"})
    public userId: number;
}
