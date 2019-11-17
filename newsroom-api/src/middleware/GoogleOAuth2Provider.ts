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
        const strategy = new OAuth2Strategy({
                callbackURL: GoogleOAuth2Provider.CALLBACK_URL,
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
            async (accessToken, refreshToken, profile, done) => {
                const email = profile.emails[0].value;

                const un = email.split("@")[0];

                if (!email) {
                    console.log("Email could not be found.");
                }

                let user = await this.userRepository.findOne({where: {email}});

                if ((user === undefined) || (user === null)) {
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
                    console.info(user);
                }

                user.accessToken = accessToken;

                await this.userRepository.save(user);

                done(null, user);
            });

        use(strategy);

        app.get("/auth/google", (req, res, done) => {
                req.session.returnTo = req.query.redirect ? req.query.redirect : "";
                done();
            },
            authenticate("google", {
                scope: [
                    "https://www.googleapis.com/auth/userinfo.profile",
                    "https://www.googleapis.com/auth/userinfo.email",
                ],
            }));

        app.get(GoogleOAuth2Provider.CALLBACK_URL,
            authenticate("google", {failureRedirect: "/login"}), function(req, res) {
                res.redirect("/" + req.session.returnTo);
            });
    }
}
