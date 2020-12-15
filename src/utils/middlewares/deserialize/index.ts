import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError, ApiErrorCode } from '@/types/api';

/**
 * Deserializes a date in a json body
 * @param keys The keys in the body containing the date
 * @param message A custom error message
 */
export function deserializeDates(keys: string | string[], message: string = 'Internal server error during body parsing'): RequestHandler {
    keys = typeof keys === 'string' ? [keys] : keys;

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            (keys as string[]).forEach(key => {
                if (req.body[key]) {
                    req.body[key] = new Date(req.body[key]);
                }
            });
            next();
        }
        catch (error) {
            const err: ApiError = {
                message: message,
                code: ApiErrorCode.INVALID_BODY_DATE_VALUE
            };
            res.status(500).send(err);
        }
    };
}