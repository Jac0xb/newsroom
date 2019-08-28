import { JoinColumn, Column, CreateDateColumn, Entity, OneToOne, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NRDocument } from "./NRDocument";
import { NRWorkflow } from "./NRWorkflow";
import { NRUser } from "./NRUser";

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

    // A brief description of the stage.
    @Column({
        length: 500,
        nullable: true,
        type: "varchar",
    })
    public description: string;

    // The Date of when this stage was created.
    @CreateDateColumn()
    public created: Date;

    // The Date of when this stage was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // One: One stage is only created by one user.
    @OneToOne(
        (type) => NRUser
    )
    @JoinColumn( {name: "creator"})
    public creator: NRUser;

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
