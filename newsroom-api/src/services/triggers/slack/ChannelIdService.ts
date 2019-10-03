import { WebClient } from "@slack/web-api";
import { Inject, Service } from "typedi";

@Service()
export class ChannelIdService {
    @Inject()
    private readonly slackWebClient: WebClient;

    public async getChannelId(name: string): Promise<string> {
        const response = await this.slackWebClient.conversations.list();

        if (response.error) {
            throw new Error("Error getting channels: " + response.error);
        }

        const channels = (response as any).channels as Array<{ id: string, name: string }>;

        const channel = channels.find((ch) => ch.name === name);
        if (channel) {
            return channel.id;
        } else {
            throw new Error("Unable to find channel by name.");
        }
    }
}
