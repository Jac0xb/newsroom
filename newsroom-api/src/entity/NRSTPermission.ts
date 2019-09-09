import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { DBConstants } from "../services/DBConstants";
import { NRRole } from "./NRRole";
import { NRStage } from "./NRStage";

// NRSTPermission objects track permissions between stages and roles.
@Entity(DBConstants.STPERM_TABLE)
export class NRSTPermission {
    @PrimaryGeneratedColumn()
    public id: number;

    // Control READ/WRITE permissions.
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
        { eager: true, onDelete: "CASCADE" },
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
        { eager: true, onDelete: "CASCADE" },
    )
    public role: NRRole;
}
