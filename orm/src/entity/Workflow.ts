import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./Document";
import { Stage } from "./Stage";

@Entity()
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

    // The timestamp of when this Workflow was created.
    @Column(
        {
            default: () => "CURRENT_TIMESTAMP",
            type: "datetime",
        },
    )
    public created: string;

    // The timestamp of when this Workflow was last edited.
    @Column(
        {
            default: () => "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            type: "datetime"
        },
    )
    public lastUpdated: string;

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
