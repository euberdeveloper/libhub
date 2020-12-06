import { Router } from 'express';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { ApiPostUsersUsernamePasswordRecoveryTokenBody, ApiPostUsersUsernamePasswordRecoveryTokenResult } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { DBUser } from '@/types/database/user';
import { DBCollections } from '@/types/database/collections';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import * as mailer from '@/utils/mailer';

import CONFIG from '@/config';

import { validateRecovery, purgeRecovery } from './utils';

export function route(router: Router): void {

    router.post('/users/password-recovery/username/:username', async (req, res) => {
        await aceInTheHole(res, async () => {
            const username = req.params.username;
            const recoverPasswordToken = uuid();

            const userExists = await dbTransaction<boolean>(async (db, session) => {
                const queryObject = { username };
                const updateObject = { $set: { recoverPasswordToken } };
                const queryResult = await db.collection(DBCollections.USERS).findOneAndUpdate(queryObject, updateObject, { returnOriginal: false, session });

                const user = queryResult.value;

                if (!user) {
                    return false;
                }

                await mailer.recoverPassword(user);
                return user;
            });

            if (!userExists) {
                const err: ApiError = {
                    message: 'Username does not exists',
                    code: ApiErrorCode.USERNAME_NOT_EXISTS
                };
                res.status(400).send(err);
                return;
            }

            res.send();
        });
    });

    router.post('/users/password-recovery/email/:email', async (req, res) => {
        await aceInTheHole(res, async () => {
            const email = req.params.email;
            const recoverPasswordToken = uuid();

            const userExists = await dbTransaction<boolean>(async (db, session) => {
                const queryObject = { email };
                const updateObject = { $set: { recoverPasswordToken } };
                const queryResult = await db.collection(DBCollections.USERS).findOneAndUpdate(queryObject, updateObject, { returnOriginal: false, session });

                const user = queryResult.value;

                if (!user) {
                    return false;
                }

                await mailer.recoverPassword(user);
                return user;
            });

            if (!userExists) {
                const err: ApiError = {
                    message: 'Email does not exists',
                    code: ApiErrorCode.EMAIL_NOT_EXISTS
                };
                res.status(400).send(err);
                return;
            }

            res.send();
        });
    });

    router.post('/users/:username/password-recovery/:token', validate(validateRecovery), purge(purgeRecovery), async (req, res) => {
        await aceInTheHole(res, async () => {
            const { username, token: recoverPasswordToken } = req.params;
            const body: ApiPostUsersUsernamePasswordRecoveryTokenBody = req.body;

            const user = await dbQuery<DBUser>(async db => {
                return db.collection(DBCollections.USERS).findOne({ username });
            });

            if (!user) {
                const err: ApiError = {
                    message: 'Username not found',
                    code: ApiErrorCode.USERNAME_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            if (user.recoverPasswordToken !== recoverPasswordToken) {
                const err: ApiError = {
                    message: 'Invalid token',
                    code: ApiErrorCode.INVALID_TOKEN
                };
                res.status(400).send(err);
                return;
            }

            await dbQuery<unknown>(async db => {
                const queryResult = await db.collection(DBCollections.USERS).updateOne({ _id: user._id }, { $set: { password: body.password, recoverPasswordToken: null } });
                const updated = queryResult.matchedCount > 0;

                if (!updated) {
                    throw new Error('User password not updated');
                }
            });

            const token = jwt.sign({ username: user.username, password: body.password }, CONFIG.SECURITY.JWT.KEY);
            const response: ApiPostUsersUsernamePasswordRecoveryTokenResult = { user, token };

            res.send(response);
        });
    });


}