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

    router.post('/users/:uid/verify/:token', validateDbId('uid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const verificationToken = req.params.token;
            const uid = req.idParams.uid;

            const user = await dbQuery<DBUser>(async db => {
                const queryObject = { _id: uid, verificationToken: verificationToken };
                const updateObject = { $set: { verificationToken: null, verified: true } };
                const updateResult = await db.collection(DBCollections.USERS).findOneAndUpdate(queryObject, updateObject, { returnOriginal: false });

                return updateResult.value;
            });

            if (!user) {
                const err: ApiError = {
                    message: 'Provided id not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(400).send(err);
                return;
            }

            const token = jwt.sign({ username: user.username, password: user.password }, CONFIG.SECURITY.JWT.KEY);
            const response: ApiPostUsersVerifyTokenResult = { user, token };

            res.send(response);
        });
    });

    router.post('/users/login', validate(validateLogin), purge(purgeLogin), async (req, res) => {
        await aceInTheHole(res, async () => {
            const body: ApiPostUsersLoginBody = req.body;

            const user = await dbQuery<DBUser>(async db => {
                return db.collection(DBCollections.USERS).findOne({ username: body.username });
            });

            if (!user) {
                const err: ApiError = {
                    message: 'Invalid login',
                    code: ApiErrorCode.INVALID_LOGIN
                };
                res.status(400).send(err);
                return;
            }

            const isPasswordValid = bcrypt.compareSync(body.password, user.password);
            if (!isPasswordValid) {
                const err: ApiError = {
                    message: 'Invalid login',
                    code: ApiErrorCode.INVALID_LOGIN
                };
                res.status(400).send(err);
                return;
            }

            if (!user.verified) {
                const err: ApiError = {
                    message: 'User not verified',
                    code: ApiErrorCode.USER_NOT_VERIFIED
                };
                res.status(400).send(err);
                return;
            }

            const token = jwt.sign({ username: user.username, password: user.password }, CONFIG.SECURITY.JWT.KEY);
            const response: ApiPostUsersLoginResult = { user, token };

            res.send(response);
        });
    });

    

}