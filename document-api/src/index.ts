import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import { Server } from "typescript-rest";
import { DocumentService } from "./service";

dotenv.config();

const port = process.env.SERVICE_PORT;

const app = express();

Server.buildServices(app, DocumentService);

app.listen(port, () => {
    console.info(`server started at http://localhost:${port}`);
});
