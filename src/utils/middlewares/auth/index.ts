import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { DBCollections, DBUser, ReqAuthenticated } from '@/types';
import { ApiError, ApiErrorCode } from '@/types/api';
import { dbQuery } from '../../database';

import CONFIG from '@/config';

/**
 * The auth middleware, that checks for the jwt token in Authorization and checks that the user has privileges
 * @param param The optional param in the url with the uid of the user
 */
export function auth(param?: string): RequestHandler {
    return async (req: Request & ReqAuthenticated, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            const tokenData: { username: string; password: string } = jwt.verify(token, CONFIG.SECURITY.JWT.KEY) as any;

            if (!tokenData || !tokenData.username) {
                const err: ApiError = {
                    message: 'User not authenticated',
                    code: ApiErrorCode.INVALID_AUTH_TOKEN
                };
                res.status(401).send(err);
                return;
            }

            const user = await dbQuery<DBUser>(async db => {
                return db.collection(DBCollections.USERS).findOne({ username: tokenData.username, password: tokenData.password });
            });

            if (!user) {
                const err: ApiError = {
                    message: 'Unexpected error, user not found in db',
                    code: ApiErrorCode.INTERNAL_SERVER_ERROR
                };
                res.status(500).send(err);
                return;
            }
            else if (param && req.params[param] != user._id) {
                const err: ApiError = {
                    message: 'User not authorized to call this api',
                    code: ApiErrorCode.USER_UNAUTHORIZED
                };
                res.status(403).send(err);
                return;
            }

            req.user = user;
            next();
        }
        catch (error) {
            const err: ApiError = {
                message: 'User not authenticated',
                code: ApiErrorCode.INVALID_AUTH_TOKEN
            };
            res.status(401).send(err);
            return;
        }
    };
}