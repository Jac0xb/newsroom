import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import { Express, NextFunction, Request, Response } from "express";
import { deserializeUser, initialize, serializeUser, session } from "passport";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRUser } from "../entity";

/**
 * Configure session storage, auth check, and passport generic stuff.
 */
@Service()
export class AuthConfig {
    @InjectRepository(NRUser)
    private userRepository: Repository<NRUser>;

    public configure(app: Express) {
        // TODO Put keys in config
        app.use(cookieSession({
            keys: ["newsroom session key"],
            maxAge: 24 * 60 * 60 * 1000,
            name: "session",
        }));

        app.use(cookieParser());

        app.use(initialize());
        app.use(session());

        app.use("/api", async (req: Request, res: Response, next: NextFunction) => {
            if (!req.user) {
                res.status(401).json({
                    message: "Please Authenticate User",
                });
            } else {
                next();
            }
        });

        app.get("/auth/logout", async (req, res) => {
            await req.logout();
            res.redirect("/");
        });

        serializeUser((user: any, done) => {
            done(null, user.id);
        });

        deserializeUser(async (id, done) => {
            const user = await this.userRepository.findOne(id);

            if (user == null) {
                console.log("User was null when deserializing session");
                done(null, false);
            } else if (user.accessToken == null) {
                console.log("User accessToken was null when deserializing session");
                done(null, false);
            } else {
                done(null, user);
            }
        });
    }
}
