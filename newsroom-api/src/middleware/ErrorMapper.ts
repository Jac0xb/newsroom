import { NextFunction, Request, Response } from "express";
import { HttpError } from "typescript-rest/dist/server/model/errors";

export class ErrorMapper {
    public static mapError(err: any, req: Request, res: Response, next: NextFunction) {
        if (err instanceof HttpError) {
            if (res.headersSent) {
                // Allows default error handler to close connection if headers already sent.
                return next(err);
            }

            res.set("Content-Type", "application/json");
            res.status(err.statusCode);
            res.json({code: err.statusCode, message: err.message});
        } else {
            next(err);
        }
    }
}
