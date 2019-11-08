import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRTriggerType } from "../../../../interfaces/INRTrigger";
import { NRDocument, NRStage, NRTrigger, NRWorkflow } from "../../entity";
import { SlackNotificationService } from "./slack/SlackNotificationService";

@Service()
export class NotificationService {
    @InjectRepository(NRTrigger)
    private triggerRepository: Repository<NRTrigger>;

    @InjectRepository(NRStage)
    private stRep: Repository<NRStage>;

    @Inject()
    private readonly slackNotificationService: SlackNotificationService;

    public sendDocumentCreatedOnWorkflowNotifications(document: NRDocument, workflow: NRWorkflow) {
        this.sendNotificationsAttachedToWorkflow(workflow, `Document "${document.name}" was created in Workflow "${workflow.name}".`);
    }

    public sendDocumentMovedToStage(document: NRDocument, stage: NRStage) {
        console.log("dc.id", document.id, "st.id", stage.id);
        this.sendNotificationsAttachedToStage(stage, `Document "${document.name}" was moved to stage "${stage.name}".`);
    }

    private async sendNotificationsAttachedToWorkflow(workflow: NRWorkflow, message: string) {
        const triggers = await this.triggerRepository.find({ where: { workflow } });

        this.sendNotifications(triggers, message);
    }

    private async sendNotificationsAttachedToDocument(document: NRDocument, message: string) {
        const triggers = await this.triggerRepository.find({ where: { document } });

        this.sendNotifications(triggers, message);
    }

    private async sendNotificationsAttachedToStage(stage: NRStage, message: string) {
        const st = await this.stRep.findOne(stage.id, { relations: ["trigger"] });

        if (st.trigger) {
            this.sendNotifications([st.trigger], message);
        }
    }

    private sendNotifications(triggers: NRTrigger[], message: string) {
        triggers.forEach((trigger) => {
            if (trigger.type === NRTriggerType.SLACK) {
                this.slackNotificationService.sendNotification(trigger, message);
            }
        });
    }
}
