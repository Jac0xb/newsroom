import "dotenv/config";
import express from "express";
import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { Server } from "typescript-rest";

import { Container } from "typedi";
import { AuthConfig } from "./middleware/AuthConfig";
import { ErrorMapper } from "./middleware/ErrorMapper";
import { FakeAuthConfig } from "./middleware/FakeAuthConfig";
import { GoogleOAuth2Provider } from "./middleware/GoogleOAuth2Provider";
import { Swagger } from "./middleware/Swagger";
import { DocumentResource } from "./resources/DocumentResource";
import { RoleResource } from "./resources/RoleResource";
import { TriggerResource } from "./resources/TriggerResource";
import { UserResource } from "./resources/UserResource";
import { WorkflowResource } from "./resources/WorkflowResource";
import { extendServiceContext } from "./ServiceContextExtension";
import { TypeDIServiceFactory } from "./TypeDIServiceFactory";

class App {
    private express: express.Express;

    constructor() {
        this.express = express();
    }

    public async configure(auth: boolean): Promise<express.Express> {
        Swagger.serve(this.express);

        // Register TypeDI Container with TypeORM, must be called before createConnection()
        useContainer(Container);

        // Start app server and listen for connections.
        await createConnection().then(async (connection) => {
            if (auth) {
                Container.get(AuthConfig).configure(this.express);

                Container.get(GoogleOAuth2Provider).configure(this.express);
            } else {
                Container.get(FakeAuthConfig).configure(this.express);
            }

            // Make sure ServiceContext gets extended
            extendServiceContext();

            // Build typescript-rest services.
            Server.registerServiceFactory(new TypeDIServiceFactory());

            Server.buildServices(this.express,
                UserResource, RoleResource, DocumentResource, WorkflowResource, TriggerResource);

            // Add error handler to return JSON error.
            this.express.use(ErrorMapper.mapError);
        }).catch((error) => {
            console.error("Error creating DB connection.", error);
        });

        return this.express;
    }
}

export default new App();
