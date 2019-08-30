import { Column, CreateDateColumn, Entity, OneToMany, JoinColumn,
         ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { NRDocument } from "./NRDocument";
import { NRPermission } from "./NRPermission";
import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";


export const WRKF_TABLE = "workflow";

@Entity(WRKF_TABLE)
export class NRWorkflow {
    @PrimaryGeneratedColumn()
    public id: number;

    // Name of the workflow.
    @Column(
        {
            length: 256,
            nullable: false,
            type: "varchar",
            unique: true,
        },
    )
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
     * Relationship: NRWorkflow
     *      - One: Each workflow can have many permissions.
     *      - Many: Each permission is associated with only one workflow.
     */
    @OneToMany(
        (type) => NRStage,
        (permission) => permission.workflow,
        { eager: true },
    )
    public permissions: NRPermission[];

}
