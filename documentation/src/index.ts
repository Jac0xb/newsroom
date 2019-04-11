import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const port = 4050;

const app = express();

fs.readFile("../newsroom-api/dist/swagger.json", "UTF-8", (err, data) => {
    if (err) {
        console.error("Error reading Swagger JSON file:", err);
        return;
    }

    const swaggerDocument = JSON.parse(data);

    app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.listen(port, () => {
        console.info(`Swagger UI started at http://localhost:${port}`);
    });
});
