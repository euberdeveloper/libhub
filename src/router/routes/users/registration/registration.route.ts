import { Router, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { ApiPostUsersLoginBody, ApiPostUsersLoginResult, ApiPostUsersSignupBody, ApiPostUsersVerifyTokenResult } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ReqIdParams } from '@/types/routes';
import { DBUser } from '@/types/database/user';
import { DBCollections } from '@/types/database/collections';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import * as mailer from '@/utils/mailer';

import { validateSignup, purgeSignup, purgeLogin, validateLogin } from './utils';

import CONFIG from '@/config';

export function route(router: Router): void {

    router.post('/users/signup', validate(validateSignup), purge(purgeSignup), async (req, res) => {
        await aceInTheHole(res, async () => {
            const body: ApiPostUsersSignupBody = req.body;

            const userExists = await dbQuery<boolean>(async db => {
                const user = await db.collection(DBCollections.USERS).findOne({ username: body.username });
                return !!user;
            });

            if (userExists) {
                const err: ApiError = {
                    message: 'User already exists',
                    code: ApiErrorCode.USER_ALREADY_EXISTS
                };
                res.status(400).send(err);
                return;
            }

            const emailExists = await dbQuery<boolean>(async db => {
                const user = await db.collection(DBCollections.USERS).findOne({ email: body.email });
                return !!user;
            });

            if (emailExists) {
                const err: ApiError = {
                    message: 'Email already exists',
                    code: ApiErrorCode.EMAIL_ALREADY_EXISTS
                };
                res.status(400).send(err);
                return;
            }

            await dbTransaction<unknown>(async (db, session) => {
                const queryResult = await db.collection(DBCollections.USERS).insertOne(body, { session });
                const userId = queryResult.insertedId;

                if (!userId) {
                    throw new Error('Error in inserting user');
                }

                await mailer.verifyUser({ _id: userId, ...body });
            });

            res.send();
        });
    });

    

    

    

}