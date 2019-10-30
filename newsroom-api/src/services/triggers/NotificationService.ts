import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRTriggerType } from "../../../../interfaces/INRTrigger";
import { NRDocument, NRTrigger, NRWorkflow } from "../../entity";
import { SlackNotificationService } from "./slack/SlackNotificationService";

@Service()
export class NotificationService {
    @InjectRepository(NRTrigger)
    private triggerRepository: Repository<NRTrigger>;

    @Inject()
    private readonly slackNotificationService: SlackNotificationService;

    public sendDocumentCreatedOnWorkflowNotifications(document: NRDocument, workflow: NRWorkflow) {
        this.sendNotificationsAttachedToWorkflow(workflow, `Document "${document.name}" was created in Workflow "${workflow.name}".`);
    }

    private async sendNotificationsAttachedToWorkflow(workflow: NRWorkflow, message: string) {
        const triggers = await this.triggerRepository.find({workflows: [workflow]});

        this.sendNotifications(triggers, message);
    }

    private async sendNotificationsAttachedToDocument(document: NRDocument, message: string) {
        const triggers = await this.triggerRepository.find({documents: [document]});

        this.sendNotifications(triggers, message);
    }

    private sendNotifications(triggers: NRTrigger[], message: string) {
        triggers.forEach((trigger) => {
            if (trigger.type === NRTriggerType.SLACK) {
                this.slackNotificationService.sendNotification(trigger, message);
            }
        });
    }
}
