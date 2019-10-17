import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { NRSTUSPermission as INRSTUSPermission } from "../interfaces";

import { DBConstants } from "./DBConstants";
import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";

/**
 * NRSTUSPermission objects track permissions between stages and users.
 */
@Entity(DBConstants.STUSPERM_TABLE)
export class NRSTUSPermission implements INRSTUSPermission {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        nullable: false,
        type: "int",
    })
    public access: number;

    /**
     * Relationship: NRStage
     *      - Many: Each stage has many associated user permissions.
     *      - One: Each user permission is for only one stage.
     */
    @ManyToOne(
        (type) => NRStage,
        (stage) => stage.usrpermissions,
        { onDelete: "CASCADE" },
    )
    public stage: NRStage;

    /**
     * Relationship: NRUser
     *      - Many: Each user has many associated permissions.
     *      - One: Each permission is for only one user.
     */
    @ManyToOne(
        (type) => NRUser,
        (user) => user.stpermissions,
        { onDelete: "CASCADE" },
    )
    public user: NRUser;
}
