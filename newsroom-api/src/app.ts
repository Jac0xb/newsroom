import "dotenv/config";
import express from "express";
import "reflect-metadata";
import { Container } from "typedi";
import { Connection, createConnection, getConnection, useContainer } from "typeorm";
import { Server } from "typescript-rest";
import { SlackWebClientBeanProvider } from "./configs/SlackWebClientBeanProvider";
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
import { PermissionService } from "./services/PermissionService";
import { TypeDIServiceFactory } from "./TypeDIServiceFactory";

class App {
    private express: express.Express;

    constructor() {
        this.express = express();
    }

    /**
     * Configure how this app should be run, mostly just for testing purposes.
     *
     * auth: Whether or not to do real user authentication.
     * docCreate: Whether or not to create actual Google Documents.
     */
    public async configure(auth: boolean, docCreate: boolean): Promise<express.Express> {
        Swagger.serve(this.express);

        SlackWebClientBeanProvider.configure();

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

            if (!(docCreate)) {
                process.env.DOC_SKIP = "Y";
            }

            // Make sure ServiceContext gets extended.
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

    /**
     * Databases only allow a single connection in some instances, so allow a way
     * for external services to access this connection.
     *
     * Primarily used for testing.
     *
     * return: The database connection used by this app.
     */
    public getDBConnection(): Connection {
        return getConnection();
    }

    /**
     * Services contain their own injected dependencies that outside sources
     * might need access to.
     *
     * Primarily used for testing.
     *
     * return: The injected PermissionService used by this app.
     */
    public getPermService(): PermissionService {
        return Container.get(PermissionService);
    }
}

export default new App();
