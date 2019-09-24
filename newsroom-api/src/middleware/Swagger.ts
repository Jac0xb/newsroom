import { Express } from "express";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

export class Swagger {
    public static serve(app: Express) {
        // Serve swagger docs on "/docs".
        fs.readFile("dist/swagger.json", "UTF-8", (err, data) => {
            if (err) {
                console.error("Error reading Swagger JSON file:", err);
                return;
            }

            const swaggerDocument = JSON.parse(data);

            app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

            app.use("/oauth2-redirect.html", (req, res) => {
                res.redirect("/docs/oauth2-redirect.html");
            });
        });
    }
}
