import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRServerOAuthCredentials } from "../entity/NRServerOAuthCredentials";

/**
 * Configures passportjs's Google OAuth2 provider.
 */
@Service()
export class GoogleOAuth2ServerCredentialsProvider {
    public static readonly AUTH_PATH = "/serverAuth/google";

    private static readonly DATABASE_ENTRY_ID = "google-server-credentials";

    // TODO: Put keys in config.
    private static readonly OAUTH_CREDS = {
        clientId: "153384745741-7h66ureoaag1j61ei5u6un0faeh4al5h.apps.googleusercontent.com",
        clientSecret: "u5Q2m0D1MO4DeulU-hCCHG06",
    };

    @InjectRepository(NRServerOAuthCredentials)
    private readonly credentialRepository: Repository<NRServerOAuthCredentials>;

    private oAuth2Client: OAuth2Client;

    constructor() {
        const {OAUTH_CREDS} = GoogleOAuth2ServerCredentialsProvider;

        this.oAuth2Client = new google.auth.OAuth2(OAUTH_CREDS);

        this.oAuth2Client.on("tokens", async (tokens) => {
            if (tokens.refresh_token) {
                console.log("Server Side refresh token updated in DB.");
                await this.saveRefreshToken(tokens.refresh_token);
            }
        });
    }

    public getOAuth2Client() {
        return this.oAuth2Client;
    }

    public async loadCredentialsFromDb() {
        const {DATABASE_ENTRY_ID} = GoogleOAuth2ServerCredentialsProvider;

        let credentials = await this.credentialRepository.findOne(DATABASE_ENTRY_ID);

        const configRefreshToken = process.env.SERVER_GOOGLE_REFRESH_TOKEN;

        if (!(credentials && credentials.refreshToken) && configRefreshToken) {
            console.log("Server side Google credentials not found in database, using config file refresh token");

            credentials = await this.credentialRepository.save({
                id: DATABASE_ENTRY_ID,
                refreshToken: configRefreshToken,
            });
        } else if (!credentials && !credentials.refreshToken && !configRefreshToken) {
            throw new Error("No refresh token could be found in database or config file");
        }

        this.oAuth2Client.setCredentials({
            refresh_token: credentials.refreshToken,
        });

        try {
            await this.oAuth2Client.getAccessToken();
        } catch (err) {
            console.log("Error getting server side Google access toen.", err);
            throw err;
        }
    }

    private async saveRefreshToken(refreshToken: string) {
        const {DATABASE_ENTRY_ID} = GoogleOAuth2ServerCredentialsProvider;

        await this.credentialRepository.save({id: DATABASE_ENTRY_ID, refreshToken});
    }
}
