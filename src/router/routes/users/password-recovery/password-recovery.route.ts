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

    



}