import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { Server } from "typescript-rest";
import { InternalServerError } from "typescript-rest/dist/server/model/errors";

import { Container } from "typedi";
import { NRUser } from "./entity";
import { ErrorMapper } from "./middleware/ErrorMapper";
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

    const userRepository = connection.getRepository(NRUser);

    // Demo middleware to inject a user into the request, this needs to go before Server.buildServices
    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // Find demo user from migration
        const user = await userRepository.findOne({userName: "tcruise"});
        if (user == null) {
            throw new InternalServerError("Unable to find mock user, run migration");
        }

        req.user = user;

        next();
    });

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
