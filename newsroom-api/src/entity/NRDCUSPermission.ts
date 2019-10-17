import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { NRDCUSPermission as INRDCUSPermission } from "../interfaces";

import { DBConstants } from "./DBConstants";
import { NRDocument } from "./NRDocument";
import { NRUser } from "./NRUser";

/**
 * NRDCUSPermission objects track permissions between documents and users.
 */
@Entity(DBConstants.DCUSPERM_TABLE)
export class NRDCUSPermission implements INRDCUSPermission {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        nullable: false,
        type: "int",
    })
    public access: number;

    /**
     * Relationship: NRDocument
     *      - Many: Each document has many associated user permissions.
     *      - One: Each user permission is for only one document.
     */
    @ManyToOne(
        (type) => NRDocument,
        (document) => document.usrpermissions,
        { onDelete: "CASCADE" },
    )
    public document: NRDocument;

    /**
     * Relationship: NRUser
     *      - Many: Each user has many associated permissions.
     *      - One: Each permission is for only one user.
     */
    @ManyToOne(
        (type) => NRUser,
        (user) => user.dcpermissions,
        { onDelete: "CASCADE" },
    )
    public user: NRUser;
}
