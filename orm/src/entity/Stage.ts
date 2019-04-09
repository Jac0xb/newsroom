import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Workflow } from "./Workflow";

@Entity()
export class Stage {

    // Primary Key column with auto generated sequence number.
    @PrimaryGeneratedColumn()
    public id: number;

    // The name of the workflow.
    @Column({
        length: 256,
        nullable: false,
        type: "varchar",
    })
    public name: string;

    // Name of creator of the workflow.
    @Column({
        length: 256,
        nullable: true,
        type: "varchar",
    })
    public creator: string; // TODO: Should relate to an Account ID later.

    // Each Stage belongs to only one workflow.
    @ManyToOne(
        (type) => Workflow,
        (workflow) => workflow.stages,
    )
    public workflow: Workflow;
}
