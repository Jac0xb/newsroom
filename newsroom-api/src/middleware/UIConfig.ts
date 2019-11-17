import express, { Express } from "express";
import * as path from "path";

export class UIConfig {
    public static serve(app: Express) {
        app.use(express.static(path.join(__dirname, "/../../../../ui/dist")));

        app.get("*", (req, res, next) => {
            if (res.headersSent) {
                // Allows default handler to close connection if headers already sent.
                return next();
            }

            res.sendFile(path.join(__dirname + "/../../../../ui/dist/index.html"));
        });
    }
}
