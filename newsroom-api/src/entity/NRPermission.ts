import { Column, CreateDateColumn, Entity, ManyToOne, 
         PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
         
import { NRRole } from "./NRRole";


// NRPermission objects are used to track different permissions.
@Entity("permission")
export class NRPermission {
    public static READ = 0;
    public static WRITE = 1;

    @PrimaryGeneratedColumn()
    public id: number;

    /**
     * The privilege level that a role has on an associated entity.
     * 
     * Can be one of:
     *      - READ: 0
     *      - WRITE: 1
     */ 
    @Column({
        nullable: false,
        type: "int",
    })
    public access: number;

    // Specifies the 'type' for the 'keyId'.
    @Column({
        nullable: false,
        type: "varchar",
    })
    public keyType: string;

    // Specifies the 'id' based on 'keyType'.
    @Column({
        nullable: false,
        type: "int",
    })
    public keyId: number;

    // The date of when this permission was created.
    @CreateDateColumn()
    public created: Date;

    // The date of when this permission was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    /**
     * Relationship: NRRole
     *      - Many: Each role has many associated permissions.
     *      - One: Each permission as a tuple of:
     */
    @ManyToOne(
        (type) => NRRole,
        (role) => role.permissions,
        { eager: true },
    )
    public role: NRRole;
}
