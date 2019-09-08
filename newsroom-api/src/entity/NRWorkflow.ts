import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable,
         ManyToOne, OneToMany, PrimaryGeneratedColumn,
         UpdateDateColumn } from "typeorm";

import { common } from "../services/Common";
import { NRDocument } from "./NRDocument";
import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";
import { NRWFPermission } from "./NRWFPermission";

@Entity(common.WRKF_TABLE)
export class NRWorkflow {
    @PrimaryGeneratedColumn()
    public id: number;

    // Name of the workflow.
    @Column({
            length: 256,
            nullable: false,
            type: "varchar",
            unique: true,
    })
    public name: string;

    // A brief description of the workflow.
    @Column({
        length: 1000,
        nullable: true,
        type: "varchar",
    })
    public description: string;

    // The date of when this workflow was created.
    @CreateDateColumn()
    public created: Date;

    // The date of when this workflow was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

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
        { eager: true },
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
}
