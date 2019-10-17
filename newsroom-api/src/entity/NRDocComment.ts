import { Column, CreateDateColumn, Entity, Index, JoinColumn,
         JoinTable, ManyToOne, OneToMany, PrimaryColumn,
         PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { NRDocComment as INRDocComment } from "../interfaces";

import { DBConstants } from "./DBConstants";
import { NRDocument } from "./NRDocument";

@Entity(DBConstants.DCCOMM_TABLE)
export class NRDocComment implements INRDocComment {
    @PrimaryGeneratedColumn()
    @PrimaryColumn()
    public id: number;

    @Column({
        length: 1024,
        nullable: true,
        type: "varchar",
    })
    public text: string;

    @CreateDateColumn()
    public created: Date;

    @UpdateDateColumn()
    public lastUpdated: Date;

    /**
     * Relationship: NRDocument
     *      - Many: Documents can have many comments.
     *      - One: Each comment is only for a single document.
     */
    @ManyToOne(
        (type) => NRDocument,
        (document) => document.comments,
        { onDelete: "CASCADE" },
    )
    public document: NRDocument;
}
