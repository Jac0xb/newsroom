import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import swaggerCombine from "swagger-combine";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const port = 4050;

const app = express();

swaggerCombine("src/swagger.json", null, null).then((swaggerDocument: any) => {
    app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.listen(port, () => {
        console.info(`Swagger UI started at http://localhost:${port}`);
    });
}).catch((error: any) => {
    console.error("Error combining Swagger JSON definitions", error);
});
