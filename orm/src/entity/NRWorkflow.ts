import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NRDocument } from "./NRDocument";
import { NRStage } from "./NRStage";

@Entity("workflow")
export class NRWorkflow {
    // Primary key.
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

    // Name of creator of the workflow.
    @Column(
        {
            length: 256,
            nullable: true,
            type: "varchar",
        },
    )
    public creator: string; // TODO: Should relate to an Account ID later.

    // A brief description of the workflow.
    @Column({
        length: 1000,
        nullable: true,
        type: "varchar",
    })
    public description: string;

    // The Date of when this workflow was created.
    @CreateDateColumn()
    public created: Date;

    // The Date of when this workflow was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Each workflow can have many associated documents.
    @OneToMany(
        (type) => NRDocument,
        (document) => document.workflow,
    )
    public documents: NRDocument[];

    // Each workflow can have many stages.
    @OneToMany(
        (type) => NRStage,
        (stage) => stage.workflow,
        { eager: true },
    )
    public stages: NRStage[];
}
