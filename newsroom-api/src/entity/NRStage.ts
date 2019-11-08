import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne,
         OneToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { INRStage } from "../../../interfaces";

import { DBConstants } from "./DBConstants";
import { NRDocument } from "./NRDocument";
import { NRSTPermission } from "./NRSTPermission";
import { NRUser } from "./NRUser";
import { NRWorkflow } from "./NRWorkflow";
import { NRTrigger } from "./NRTrigger";

/**
 * NRStage objects are pieced together to make a workflow.
 */
@Entity(DBConstants.STGE_TABLE)
export class NRStage implements INRStage {

    @PrimaryGeneratedColumn()
    public id: number;

    // Stages position in workflow.
    @Column()
    public sequenceId: number;

    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    @Column({
        length: 500,
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
     *      - Many: Users can make many stages.
     *      - One: Each stage is only created by one user.
     */
    @ManyToOne(
        (type) => NRUser,
    )
    @JoinColumn({ name: "creator" })
    public creator: NRUser;

    /**
     * Relationship: NRWorkflow
     *      - Many: Workflows can have many stages.
     *      - One: Each stage only belongs to a single workflow.
     */
    @ManyToOne(
        (type) => NRWorkflow,
        (workflow) => workflow.stages,
        { onDelete: "CASCADE" },
    )
    public workflow: NRWorkflow;

    /**
     * Relationship: NRDocument
     *      - One: Each document can only be a part of a single stage.
     *      - Many Each stage can have many documents.
     */
    @OneToMany(
        (type) => NRDocument,
        (document) => document.stage,
        { onDelete: "CASCADE"},
    )
    public documents: NRDocument[];

    /**
     * Relationship: NRSTPermission
     *      - One: Each permission is only associated with one stage.
     *      - Many: Each stage can have many permissions.
     */
    @OneToMany(
        (type) => NRSTPermission,
        (permission) => permission.stage,
    )
    public permissions: NRSTPermission[];

    @OneToOne(
        (type) => NRTrigger,
        (trigger) => trigger.stage,
        { onDelete: "SET NULL" }
    )
    @JoinColumn()
    public trigger: NRTrigger;
}
