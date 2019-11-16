import { google } from "googleapis";
import { Service } from "typedi";

@Service()
export class GoogleOAuth2ServerCredentialsProvider {
    private auth = new google.auth.GoogleAuth({
        clientOptions: {
            subject: "connor@newsroomut.com",
        },
        scopes: [
            "https://www.googleapis.com/auth/drive",
        ],
    });

    public getOAuth2Client() {
        return this.auth;
    }
}
