import dotenv from "dotenv";
import express from "express";
import "reflect-metadata";
import { Container } from "typedi";
import { Connection, createConnection, getConnection, useContainer } from "typeorm";
import { Server } from "typescript-rest";
import { GoogleOAuth2ServerCredentialsProvider } from "./configs/GoogleOAuth2ServerCredentialsProvider";
import { SlackWebClientBeanProvider } from "./configs/SlackWebClientBeanProvider";
import { AuthConfig } from "./middleware/AuthConfig";
import { ErrorMapper } from "./middleware/ErrorMapper";
import { FakeAuthConfig } from "./middleware/FakeAuthConfig";
import { GoogleOAuth2Provider } from "./middleware/GoogleOAuth2Provider";
import { Swagger } from "./middleware/Swagger";
import { CurrentUserResource } from "./resources/CurrentUserResource";
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

        dotenv.config();
    }

    /**
     * Configure how this app should be run, mostly just for testing purposes.
     *
     * auth: Whether or not to do real user authentication.
     * docCreate: Whether or not to create actual Google Documents.
     */
    public async configure(auth: boolean, do_google: boolean): Promise<express.Express> {
        Swagger.serve(this.express);

        SlackWebClientBeanProvider.configure();

        // Register TypeDI Container with TypeORM, must be called before createConnection()
        useContainer(Container);

        if (do_google === false) {
            process.env.DO_GOOGLE = "N";
        }

        // Start app server and listen for connections.
        await createConnection().then(async (connection) => {
            if (auth) {
                Container.get(AuthConfig).configure(this.express);

                Container.get(GoogleOAuth2Provider).configure(this.express);

                // Setup admin based on ADMIN_EMAIL.
                await Container.get(UserResource).configure();

                await Container.get(GoogleOAuth2ServerCredentialsProvider).loadCredentialsFromDb();
            } else {
                Container.get(FakeAuthConfig).configure(this.express);
            }

            // Make sure ServiceContext gets extended.
            extendServiceContext();

            // Build typescript-rest services.
            Server.registerServiceFactory(new TypeDIServiceFactory());

            Server.buildServices(this.express,
                UserResource, CurrentUserResource, RoleResource, DocumentResource, WorkflowResource, TriggerResource);

            // Add error handler to return JSON error.
            this.express.use(ErrorMapper.mapError);
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
