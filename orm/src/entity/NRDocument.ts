import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NRStage } from "./NRStage";
import { NRWorkflow } from "./NRWorkflow";

@Entity("document")
export class NRDocument {
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

    // The actual plain text content of the article.
    @Column({
        nullable: true,
    })
    public content: string;

    // The Date of when this document was created.
    @CreateDateColumn()
    public created: Date;

    // The Date of when this document was last edited.
    @UpdateDateColumn()
    public lastUpdated: Date;

    // Each document belongs to only one workflow.
    @ManyToOne(
        (type) => NRWorkflow,
        (workflow) => workflow.documents,
    )
    public workflow: NRWorkflow;

    // Each document belongs to only one stage.
    @ManyToOne(
        (type) => NRStage,
        (stage) => stage.documents,
    )
    public stage: NRStage;
}
