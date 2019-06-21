import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { Server } from "typescript-rest";
import { HttpError } from "typescript-rest/dist/server/model/errors";
import { DocumentService } from "./services/DocumentService";
import { WorkflowService } from "./services/WorkflowService";

dotenv.config();

const port = process.env.SERVICE_PORT || 8000;

const app = express();

// Build typescript-rest services.
Server.buildServices(app, DocumentService, WorkflowService);

// Add error handler to return JSON error.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof HttpError) {
        if (res.headersSent) {
            // Allows default error handler to close connection if headers already sent.
            return next(err);
        }

        res.set("Content-Type", "application/json");
        res.status(err.statusCode);
        res.json({ code: err.statusCode, message: err.message });
    } else {
        next(err);
    }
});

createConnection().then(async (connection) => {
    app.listen(port, () => {
        console.info(`Server started at http://localhost:${port}.`);
    });
}).catch((error) => {
    console.error("Error creating DB connection.", error);
});
