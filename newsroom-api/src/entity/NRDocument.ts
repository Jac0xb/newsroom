import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import { DBConstants } from "./DBConstants";
import { NRDCPermission } from "./NRDCPermission";
import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";
import { NRWorkflow } from "./NRWorkflow";

@Entity(DBConstants.DOCU_TABLE)
export class NRDocument {
    @PrimaryGeneratedColumn()
    @PrimaryColumn()
    public id: number;

    @Index()
    @Column()
    public googleDocId: string;

    // Name of the document.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    // A brief description of the document.
    @Column({
        length: 1000,
        nullable: true,
        type: "varchar",
    })
    public description: string;

    // The date of when this document was created.
    @CreateDateColumn()
    public created: Date;

    // The date of when this document was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Populated and returned on request.
    public permission: number;

    /**
     * Relationship: NRUser
     *      - Many: Users can make many documents.
     *      - One: Each document is only created by one user.
     */
    @ManyToOne(
        (type) => NRUser,
        {eager: true},
    )
    @JoinColumn({name: "creator"})
    public creator: NRUser;

    /**
     * Relationship: NRWorkflow
     *      - Many: Workflows can have many documents.
     *      - One: Each document is a part of only one workflow.
     */
    @ManyToOne(
        (type) => NRWorkflow,
        (workflow) => workflow.documents,
        { eager: true, onDelete: "CASCADE" },
    )
    public workflow: NRWorkflow;

    /**
     * Relationship: NRStage
     *      - Many: Stages can have many documents.
     *      - One: Each document can only be in one stage.
     */
    @ManyToOne(
        (type) => NRStage,
        (stage) => stage.documents,
        { eager: true },
    )
    public stage: NRStage;

    /**
     * Relationship: NRDCPermission
     *      - One: Each permission is only associated with one document.
     *      - Many: Each document can have many permissions.
     */
    @OneToMany(
        (type) => NRDCPermission,
        (permission) => permission.document,
    )
    @JoinTable()
    public permissions: NRDCPermission[];

}
