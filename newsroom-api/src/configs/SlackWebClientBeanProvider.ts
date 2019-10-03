import { WebClient } from "@slack/web-api";
import { Container } from "typedi";

export class SlackWebClientBeanProvider {
    public static configure() {
        if (!process.env.SLACK_TOKEN) {
            throw new Error("env.SLACK_TOKEN is required.");
        }

        Container.set(WebClient, new WebClient(process.env.SLACK_TOKEN));
    }
}
