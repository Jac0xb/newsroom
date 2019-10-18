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

import { NRDocument as INRDocument } from "../interfaces";

import { DBConstants } from "./DBConstants";
import { NRDocComment } from "./NRDocComment";
import { NRStage } from "./NRStage";
import { NRUser } from "./NRUser";
import { NRWorkflow } from "./NRWorkflow";

@Entity(DBConstants.DOCU_TABLE)
export class NRDocument implements INRDocument {
    @PrimaryGeneratedColumn()
    @PrimaryColumn()
    public id: number;

    @Index()
    @Column()
    public googleDocId: string;

    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
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

    // Populated and returned on request.
    public permission: number;

    /**
     * Relationship: NRUser
     *      - Many: Users can make many documents.
     *      - One: Each document is only created by one user.
     */
    @ManyToOne(
        (type) => NRUser,
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
        { onDelete: "SET NULL" },
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
        { onDelete: "SET NULL" },
    )
    public stage: NRStage;

    /**
     * Relationship: NRDocComment
     *      - One: Each comment is only associated with a single document.
     *      - Many: Each document can have many comments.
     */
    @OneToMany(
        (type) => NRDocComment,
        (comments) => comments.document,
    )
    public comments: NRDocComment[];
}
