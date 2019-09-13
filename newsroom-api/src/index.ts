import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { Server } from "typescript-rest";

import { Container } from "typedi";
import { AuthConfig } from "./middleware/AuthConfig";
import { ErrorMapper } from "./middleware/ErrorMapper";
import { GoogleOAuth2Provider } from "./middleware/GoogleOAuth2Provider";
import { Swagger } from "./middleware/Swagger";
import { DocumentResource } from "./resources/DocumentResource";
import { RoleResource } from "./resources/RoleResource";
import { UserResource } from "./resources/UserResource";
import { WorkflowResource } from "./resources/WorkflowResource";
import { extendServiceContext } from "./ServiceContextExtension";
import { TypeDIServiceFactory } from "./TypeDIServiceFactory";

dotenv.config();

const port = process.env.SERVICE_PORT || 8000;
const app = express();

Swagger.serve(app);

// Register TypeDI Container with TypeORM, must be called before createConnection()
useContainer(Container);

// Start app server and listen for connections.
createConnection().then(async (connection) => {
    Container.get(AuthConfig).configure(app);

    Container.get(GoogleOAuth2Provider).configure(app);

    // Make sure ServiceContext gets extended
    extendServiceContext();

    // Build typescript-rest services.
    Server.registerServiceFactory(new TypeDIServiceFactory());

    Server.buildServices(app, UserResource, RoleResource, DocumentResource, WorkflowResource);

    // Add error handler to return JSON error.
    app.use(ErrorMapper.mapError);

    app.listen(port, () => {
        console.info(`Server started at http://localhost:${port}.`);
    });

}).catch((error) => {
    console.error("Error creating DB connection.", error);
});
