import express, { NextFunction, Request, Response } from "express";
import open from "open";
import { authenticate, use } from "passport";
import { OAuth2Strategy } from "passport-google-oauth";

const AUTH_PATH = "/serverAuth/google";

const STRATEGY_NAME = "google-server";

const CALLBACK_PATH = "/serverAuth/google/callback";

// TODO: Put keys in config.
const OAUTH_CREDS = {
    callbackURL: CALLBACK_PATH,
    clientID: "153384745741-7h66ureoaag1j61ei5u6un0faeh4al5h.apps.googleusercontent.com",
    clientSecret: "u5Q2m0D1MO4DeulU-hCCHG06",
};

const app = express();

const strategy = new OAuth2Strategy(OAUTH_CREDS,
    async (accessToken, refreshToken, profile, done) => {
        console.log(`Server Side Refresh Token: ${refreshToken}`);

        done("", null);
    });

strategy.name = STRATEGY_NAME;

use(STRATEGY_NAME, strategy);

const options = {
    accessType: "offline",
    scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/drive",
    ],
};

const server = app.listen(8000, () => {
    app.get(AUTH_PATH, authenticate(STRATEGY_NAME, options));

    app.get(CALLBACK_PATH, authenticate(STRATEGY_NAME, {
            failWithError: true,
        }),
        function(req, res) {
            res.send("<h2>Success, this window can be closed.</h2>");

            server.close();
        },
        function(err: any, req: Request, res: Response, _: NextFunction) {
            res.send("<h2>Success, this window can be closed.</h2>");

            server.close();
        });

    console.log("Waiting for Google OAuth flow completion.");

    open(`http://localhost:8000${AUTH_PATH}`);
});
