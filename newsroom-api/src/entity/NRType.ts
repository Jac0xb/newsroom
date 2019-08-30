import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export const TYPE_TABLE = "type";

// NRType objects are used to map a numerical key to an entity type.
@Entity(TYPE_TABLE)
export class NRType {
    public static WRKF_KEY = 0
    public static WRKF_VAL = 'WRKF'
    public static STGE_KEY = 1
    public static STGE_VAL = 'STGE'
    public static DOCU_KEY = 2
    public static DOCU_VAL = 'DOCU'
    public static ROLE_KEY = 3
    public static ROLE_VAL = 'ROLE'
    public static USER_KEY = 4
    public static USER_VAL = 'USER'

    @PrimaryGeneratedColumn()
    public id: number;

    // Numerical key for this type.
    @Column({
        nullable: false,
        unique: true,
        type: "int",
    })
    public key: number;

    // Numerical value for this type.
    @Column({
        length: 4,
        nullable: false,
        unique: true,
        type: "varchar"
    })
    public value: string;
}
