import express, { Express } from "express";
import * as path from "path";

export class UIConfig {
    public static serve(app: Express) {
        // __dirname is dist/newsroom-api/src/middleware

        let publicDir: string;
        if (process.env.NODE_ENV === "prod") {
            publicDir = "../../../public";
        } else {
            publicDir = "../../../../../ui/dist";

        }

        app.use(express.static(path.join(__dirname, publicDir)));

        app.get("*", (req, res, next) => {
            if (res.headersSent) {
                // Allows default handler to close connection if headers already sent.
                return next();
            }

            res.sendFile(path.join(__dirname, publicDir, "index.html"));
        });
    }
}
