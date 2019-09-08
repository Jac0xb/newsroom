import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { common } from "../services/Common";
import { NRDocument } from "./NRDocument";
import { NRRole } from "./NRRole";

// NRDCPermission objects track permissions between documents and roles.
@Entity(common.DCPERM_TABLE)
export class NRDCPermission {
    @PrimaryGeneratedColumn()
    public id: number;

    // Control READ/WRITE permissions.
    @Column({
        nullable: false,
        type: "int",
    })
    public access: number;

    /**
     * Relationship: NRDocument
     *      - Many: Each document has many associated roles.
     *      - One: Each permission is for only one document.
     */
    @ManyToOne(
        (type) => NRDocument,
        (document) => document.permissions,
        { eager: true, onDelete: "CASCADE" },
    )
    public document: NRDocument;

    /**
     * Relationship: NRRole
     *      - Many: Each role has many associated permissions.
     *      - One: Each permission is for only one role.
     */
    @ManyToOne(
        (type) => NRRole,
        (role) => role.dcpermissions,
        { eager: true, onDelete: "CASCADE" },
    )
    public role: NRRole;
}
