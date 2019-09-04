import { Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

import { NRDocument } from "./NRDocument";
import { NRRole } from "./NRRole";

// NRDCPermission objects track permissions between documents and roles.
@Entity("dcpermission")
export class NRDCPermission {
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
     * Relationship: NRDocument
     *      - Many: Each document has many associated roles.
     *      - One: Each permission is for only one document.
     */
    @ManyToOne(
        (type) => NRDocument,
        (document) => document.permissions,
        { eager: true },
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
        { eager: true },
    )
    public role: NRRole;
}
