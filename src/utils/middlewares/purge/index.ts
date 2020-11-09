import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError, ApiErrorCode } from '@/types/api';

export function purge(purger: (body: any, req: Request) => any, message: string = 'Internal server error during body parsing'): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const rawBody = req.body;
            req.body = purger(rawBody, req);
            next();
        }
        catch (error) {
            const err: ApiError = {
                message: message,
                code: ApiErrorCode.ERROR_WHILE_PURGING_BODY
            };
            res.status(500).send(err);
        }
    };
}

export async function asyncPurge(purger: (body: any, req: Request) => Promise<any>, message: string = 'Internal server error during body parsing'): Promise<RequestHandler> {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rawBody = req.body;
            req.body = await purger(rawBody, req);
            next();
        }
        catch (error) {
            const err: ApiError = {
                message: message,
                code: ApiErrorCode.ERROR_WHILE_PURGING_BODY
            };
            res.status(500).send(err);
        }
    };
}