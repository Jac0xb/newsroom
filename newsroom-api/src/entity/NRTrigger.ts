import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { NRDocument } from "./NRDocument";
import { NRWorkflow } from "./NRWorkflow";
import { NRStage } from "./NRStage";

import { INRTrigger, NRTriggerType } from "../../../interfaces";

@Entity()
export class NRTrigger implements INRTrigger {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public type: NRTriggerType;

    @Column({
        nullable: false,
    })
    public channelName: string;

    @OneToOne(
        () => NRStage,
        (stage) => stage.trigger
    )
    public stage: NRStage;

    @OneToOne(
        () => NRDocument,
        (document) => document.trigger
    )
    public document: NRDocument;

    @OneToOne(
        () => NRWorkflow,
        (workflow) => workflow.trigger
    )
    public workflow: NRWorkflow;
}
