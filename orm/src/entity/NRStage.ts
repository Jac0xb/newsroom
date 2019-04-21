import {
    Column, CreateDateColumn, Entity, ManyToOne, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn,
} from "typeorm";
import { NRDocument } from "./NRDocument";
import { NRWorkflow } from "./NRWorkflow";

@Entity("stage")
export class NRStage {
    // Primary key.
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

    // Name of creator of the stage.
    @Column({
        length: 256,
        nullable: true,
        type: "varchar",
    })
    public creator: string; // TODO: Should relate to an Account ID later.

    // The Date of when this stage was created.
    @CreateDateColumn()
    public created: Date;

    // The Date of when this stage was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Each stage belongs to only one workflow.
    @ManyToOne(
        (type) => NRWorkflow,
        (workflow) => workflow.stages,
    )
    public workflow: NRWorkflow;

    // Each stage can have many associated documents.
    @OneToMany(
        (type) => NRDocument,
        (document) => document.stage,
    )
    public documents: NRDocument[];
}
