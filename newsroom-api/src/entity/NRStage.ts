import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
         OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { NRDocument } from "./NRDocument";
import { NRUser } from "./NRUser";
import { NRWorkflow } from "./NRWorkflow";


export const STGE_TABLE = "stage";

// NRStage objects are pieced together to make a workflow.
@Entity(STGE_TABLE)
export class NRStage {
    @PrimaryGeneratedColumn()
    public id: number;

    // Stages position in workflow.
    @Column()
    public sequenceId: number;

    // Name of the stage.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    // A brief description of the stage.
    @Column({
        length: 500,
        nullable: true,
        type: "varchar",
    })
    public description: string;

    // The date of when this stage was created.
    @CreateDateColumn()
    public created: Date;

    // The date of when this stage was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    /**
     * Relationship: NRUser
     *      - Many: Users can make many stages.
     *      - One: Each stage is only created by one user. 
     */
    @ManyToOne(
        (type) => NRUser
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
    )
    public documents: NRDocument[];
}
