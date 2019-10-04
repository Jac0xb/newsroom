import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable,
         ManyToOne, OneToMany, PrimaryGeneratedColumn,
         UpdateDateColumn } from "typeorm";

import { DBConstants } from "./DBConstants";
import { NRDocument } from "./NRDocument";
import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";
import { NRWFPermission } from "./NRWFPermission";
import { NRWFUSPermission } from "./NRWFUSPermission";

/**
 * NRWorkflow objects are made up by stages used to track documents.
 */
@Entity(DBConstants.WRKF_TABLE)
export class NRWorkflow {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
            length: 256,
            nullable: false,
            type: "varchar",
            unique: true,
    })
    public name: string;

    @Column({
        length: 1000,
        nullable: true,
        type: "varchar",
    })
    public description: string;

    @CreateDateColumn()
    public created: Date;

    @UpdateDateColumn()
    public lastUpdated: Date;

    // Populate and return on request.
    public permission: number;

    /**
     * Relationship: NRUser
     *      - Many: Users can make many workflows.
     *      - One: Each workflow is only created by one user.
     */
    @ManyToOne(
        (type) => NRUser,
    )
    @JoinColumn({ name: "creator" })
    public creator: NRUser;

    /**
     * Relationship: NRDocument
     *      - One: Each document is a part of only one workflow.
     *      - Many: Each workflow can have many associated documents.
     */
    @OneToMany(
        (type) => NRDocument,
        (document) => document.workflow,
    )
    public documents: NRDocument[];

    /**
     * Relationship: NRStage
     *      - One: Each document is a part of only one stage.
     *      - Many: Each stage can have many documents.
     */
    @OneToMany(
        (type) => NRStage,
        (stage) => stage.workflow,
    )
    public stages: NRStage[];

    /**
     * Relationship: NRWFPermission
     *      - One: Each permission is only associated with one workflow.
     *      - Many: Each workflow can have many permissions.
     */
    @OneToMany(
        (type) => NRWFPermission,
        (permission) => permission.workflow,
    )
    @JoinTable()
    public permissions: NRWFPermission[];

    /**
     * Relationship: NRWFUSPermission
     *      - One: Each user permission is only associated with one workflow.
     *      - Many: Each workflow can have many user permissions.
     */
    @OneToMany(
        (type) => NRWFUSPermission,
        (permission) => permission.workflow,
    )
    @JoinTable()
    public usrpermissions: NRWFUSPermission[];

}
