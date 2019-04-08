import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import * as routes from "./routes";

dotenv.config();

const port = process.env.SERVICE_PORT;

const app = express();

routes.register(app);

app.listen(port, () => {
    console.info(`server started at http://localhost:${port}`);
});
