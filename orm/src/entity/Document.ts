import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Stage } from "./Stage";
import { Workflow } from "./Workflow";

@Entity("document")
export class Document {
    // Primary key.
    @PrimaryGeneratedColumn()
    public id: number;

    // Name of the document.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    // Name of creator of the document.
    @Column({
        length: 256,
        nullable: true,
        type: "varchar",
    })
    public creator: string; // TODO: Should relate to an Account ID later.

    // The Date of when this document was created.
    @CreateDateColumn()
    public created: Date;

    // The Date of when this document was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Each document belongs to only one workflow.
    @ManyToOne(
        (type) => Workflow,
        (workflow) => workflow.documents,
    )
    public workflow: Workflow;

    // Each document belongs to only one stage.
    @ManyToOne(
        (type) => Stage,
        (stage) => stage.documents,
    )
    public stage: Stage;
}
