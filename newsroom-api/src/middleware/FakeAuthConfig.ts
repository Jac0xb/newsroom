import { Express, NextFunction, Request, Response } from "express";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NRUser } from "../entity";

/**
 * Configure session storage, auth check, and passport generic stuff.
 */
@Service()
export class FakeAuthConfig {
    @InjectRepository(NRUser)
    private userRepository: Repository<NRUser>;

    public configure(app: Express) {
        app.use("/api", async (req: Request, res: Response, next: NextFunction) => {
            const id = req.headers["user-id"] as string;

            if (!id) {
                res.status(401).json({
                    message: "Please Authenticate User",
                });
            } else {
                req.user = this.userRepository.findOne(id);
                next();
            }
        });
    }
}
