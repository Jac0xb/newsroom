import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Workflow } from "./Workflow";

@Entity()
export class Document {
    // Primary Key column with auto generated sequence number.
    @PrimaryGeneratedColumn()
    public id: number;

    // Name of the document.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    // Each document belongs to only one workflow.
    @ManyToOne(
        (type) => Workflow,
        (workflow) => workflow.documents,
    )
    public workflow: Workflow;
}
