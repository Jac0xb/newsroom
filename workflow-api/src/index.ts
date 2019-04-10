import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import { createConnection } from "typeorm";
import { Server } from "typescript-rest";
import { WorkflowService } from "./service";

dotenv.config();

const port = process.env.SERVICE_PORT;

const app = express();

Server.buildServices(app, WorkflowService);

createConnection().then(async (connection) => {
    app.listen(port, () => {
        console.info(`Workflow API started at http://localhost:${port}`);
    });
}).catch((error) => {
    console.error("Error creating DB connection", error);
});
