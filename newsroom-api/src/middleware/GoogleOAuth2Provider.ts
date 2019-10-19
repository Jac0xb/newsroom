import { Express } from "express";
import { authenticate, use } from "passport";
import { OAuth2Strategy } from "passport-google-oauth";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRUser } from "../entity";

/**
 * Configures passportjs's Google OAuth2 provider.
 */
@Service()
export class GoogleOAuth2Provider {
    private static readonly CALLBACK_URL = "/auth/google/callback";

    @InjectRepository(NRUser)
    private userRepository: Repository<NRUser>;

    public configure(app: Express) {
        // TODO: Put keys in config.
        const strategy = new OAuth2Strategy({
                callbackURL: GoogleOAuth2Provider.CALLBACK_URL,
                clientID: "153384745741-7h66ureoaag1j61ei5u6un0faeh4al5h.apps.googleusercontent.com",
                clientSecret: "u5Q2m0D1MO4DeulU-hCCHG06",
            },
            async (accessToken, refreshToken, profile, done) => {
                const email = profile.emails[0].value;

                const un = email.split("@")[0];

                let user = await this.userRepository.findOne({ where: { userName: un } });

                if (user === null) {
                    console.log("USER WAS NULL.");
                    user = this.userRepository.create();
                    user.email = email;
                    user.userName = un;
                    user.firstName = profile.name.givenName;
                    user.lastName = profile.name.familyName;
                } else if (user.email === email) {
                    console.log("USER WAS NOT NULL.");
                    user.firstName = profile.name.givenName;
                    user.lastName = profile.name.familyName;
                }

                user.accessToken = accessToken;

                await this.userRepository.save(user);

                done(null, user);
            });

        use(strategy);

        app.get("/auth/google",
            (req, res, done) => {
                req.session.returnTo = req.query.redirect ? req.query.redirect : "";
                done();
            },
            authenticate("google", {
                scope: [
                    "https://www.googleapis.com/auth/userinfo.profile",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/drive.file",
                ],
            }));

        app.get(GoogleOAuth2Provider.CALLBACK_URL,
            authenticate("google", {failureRedirect: "/login"}), function(req, res) {
                res.redirect("/" + req.session.returnTo);
            });
    }
}
