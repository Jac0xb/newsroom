import { WebClient } from "@slack/web-api";
import { Inject, Service } from "typedi";
import { NRTrigger } from "../../../entity";
import { ChannelIdService } from "./ChannelIdService";

@Service()
export class SlackNotificationService {
    private readonly slackWebClient: WebClient = new WebClient(process.env.SLACK_TOKEN);

    @Inject()
    private readonly channelIdService: ChannelIdService;

    public async sendNotification(trigger: NRTrigger, message: string) {
        try {
            const channelId = await this.channelIdService.getChannelId(trigger.channelName);

            const response = await this.slackWebClient.chat.postMessage({
                channel: channelId,
                text: message,
            });

            if (response.error) {
                console.log("Error sending Slack Notification: " + response.error);
            }
        } catch (err) {
            console.log("Error sending Slack Notification: " + err);
        }
    }
}
