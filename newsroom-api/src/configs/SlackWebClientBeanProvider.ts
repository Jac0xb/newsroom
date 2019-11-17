import { WebClient } from "@slack/web-api";
import { Container } from "typedi";

export class SlackWebClientBeanProvider {
    public static configure() {
        Container.set(WebClient, new WebClient(process.env.SLACK_TOKEN));
    }
}
