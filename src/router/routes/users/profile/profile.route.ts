import { Router, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';

import { ApiPatchUsersUidProfileBody, ApiPatchUsersUidProfilePassowrdBody, ApiPatchUsersUidProfilePassowrdResult, ApiPostUsersLoginBody, ApiPostUsersLoginResult, ApiPostUsersSignupBody, ApiPutUsersUidProfileBody } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ReqAuthenticated } from '@/types/routes';
import { DBUser } from '@/types/database/user';
import { DBCollections } from '@/types/database/collections';

import { dbQuery, dbTransaction, ObjectID } from '@/utils/database';
import { validate, purge, auth, upload } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import { rename, mkdir, exists, unlink } from '@/utils/fs-async';

import { purgePutProfile, validatePutProfile, purgePatchProfile, purgePutProfilePassword, validatePatchProfile, validatePutProfilePassword } from './utils';

import CONFIG from '@/config';

export function route(router: Router): void {

    router.put('/users/:uid/profile', auth('uid'), validate(validatePutProfile), purge(purgePutProfile), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const body: ApiPutUsersUidProfileBody = req.body;

            await dbQuery<unknown>(async db => {
                const newUser: Omit<DBUser, '_id'> = { 
                    ...user,
                    ...body
                };
                await db.collection(DBCollections.USERS).replaceOne({ _id: user._id }, newUser, { upsert: true });
            });

            res.send();
        });
    });

    router.patch('/users/:uid/profile', auth('uid'), validate(validatePatchProfile), purge(purgePatchProfile), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const body: ApiPatchUsersUidProfileBody = req.body;

            const updated = await dbQuery<boolean>(async db => {
                const updateResult = await db.collection(DBCollections.USERS).updateOne({ _id: user._id }, { $set: body });
                return updateResult.matchedCount > 0;
            });

            if (!updated) {
                const err: ApiError = {
                    message: 'User not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send();
        });
    });

}