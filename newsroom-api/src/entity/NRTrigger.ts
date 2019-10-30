import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NRDocument } from "./NRDocument";
import { NRWorkflow } from "./NRWorkflow";

import { INRTrigger, NRTriggerType } from "../../../interfaces";

@Entity()
export class NRTrigger implements INRTrigger {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public type: NRTriggerType;

    @Column({
        nullable: true,
    })
    public channelName: string;

    @OneToMany(
        () => NRDocument,
        (document) => document.id,
    )
    public documents: NRDocument[];

    @OneToMany(
        () => NRWorkflow,
        (workflow) => workflow.id,
    )
    public workflows: NRWorkflow[];
}
