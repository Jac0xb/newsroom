import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { NRStage } from "./NRStage";
import { NRRole } from "./NRRole";

// NRSTPermission objects track permissions between stages and roles.
@Entity("stpermission")
export class NRSTPermission {
    public static READ = 0;
    public static WRITE = 1;

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        nullable: false,
        type: "int",
    })
    public access: number;

    /**
     * Relationship: NRStage
     *      - Many: Each stage has many associated roles.
     *      - One: Each permission is for only one stage.
     */
    @ManyToOne(
        (type) => NRStage,
        (stage) => stage.permissions,
        { eager: true },
    )
    public stage: NRStage;

    /**
     * Relationship: NRRole
     *      - Many: Each role has many associated permissions.
     *      - One: Each permission is for only one role.
     */
    @ManyToOne(
        (type) => NRRole,
        (role) => role.stpermissions,
        { eager: true },
    )
    public role: NRRole;
}
