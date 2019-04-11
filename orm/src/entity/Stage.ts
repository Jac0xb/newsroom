import {
    Column, CreateDateColumn, Entity, ManyToOne, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn,
} from "typeorm";
import { Document } from "./Document";
import { Workflow } from "./Workflow";

@Entity("stage")
export class Stage {
    // Primary key.
    @PrimaryGeneratedColumn()
    public id: number;

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

    // The ID of the stage that comes before this one.
    // NULL if this stage is the starting one.
    @Column({
        nullable: true,
        type: "int",
    })
    public previous: number;

    // The ID of the stage that comes after this one.
    // NULL if this stage is the ending one.
    @Column({
        nullable: true,
        type: "int",
    })
    public next: number;

    // Each stage belongs to only one workflow.
    @ManyToOne(
        (type) => Workflow,
        (workflow) => workflow.stages,
    )
    public workflow: Workflow;

    // Each stage can have many associated documents.
    @OneToMany(
        (type) => Document,
        (document) => document.stage,
    )
    public documents: Document[];
}
