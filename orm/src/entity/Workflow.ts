import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Document } from "./Document";
import { Stage } from "./Stage";

@Entity("workflow")
export class Workflow {
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

    // The Date of when this workflow was created.
    @CreateDateColumn()
    public created: Date;

    // The Date of when this workflow was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Each workflow can have many associated documents.
    @OneToMany(
        (type) => Document,
        (document) => document.workflow,
    )
    public documents: Document[];

    // Each workflow can have many stages.
    @OneToMany(
        (type) => Stage,
        (stage) => stage.workflow,
    )
    public stages: Stage[];
}
