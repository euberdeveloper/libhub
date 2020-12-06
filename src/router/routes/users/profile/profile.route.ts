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

    router.put('/users/:uid/profile/password', auth('uid'), validate(validatePutProfilePassword), purge(purgePutProfilePassword), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const body: ApiPatchUsersUidProfilePassowrdBody = req.body;

            await dbQuery<unknown>(async db => {
                const queryResult = await db.collection(DBCollections.USERS).updateOne({ _id: user._id }, { $set: { password: body.password } });
                const updated = queryResult.matchedCount > 0;

                if (!updated) {
                    throw new Error('User password not updated');
                }
            });

            const token = jwt.sign({ username: user.username, password: body.password }, CONFIG.SECURITY.JWT.KEY);
            const response: ApiPatchUsersUidProfilePassowrdResult = { token };

            res.send(response);
        });
    });

    router.put('/users/:uid/profile/avatar', auth('uid'), upload(CONFIG.UPLOAD.TEMP_LOCATIONS.USERS, 'avatar'), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const uid = user._id as unknown as ObjectID;
            
            const result = await dbTransaction<string>(async (db, session) => {
                const avatarName = `avatar.jpg`;
                const avatarPath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.USERS(uid.toHexString()), avatarName);

                const result = `${CONFIG.SERVER.HOSTNAME}/stored/users/${uid.toHexString()}/avatar.jpg`;

                const queryBody = { $set: { avatar: result } };
                const queryResult = await db.collection(DBCollections.USERS).updateOne({ _id: uid }, queryBody, { session });

                if (queryResult.matchedCount < 1) {
                    throw new Error('Error in updating user');
                }

                const tempPath = req.file.path;
                await mkdir(CONFIG.UPLOAD.STORED_LOCATIONS.USERS(uid.toHexString()), { recursive: true });
                await rename(tempPath, avatarPath);

                return result;
            });

            res.send(result);
        });
    });

    router.delete('/users/:uid/profile/avatar', auth('uid'), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const uid = user._id as unknown as ObjectID;
            
            await dbTransaction<unknown>(async (db, session) => {
                const queryResult = await db.collection(DBCollections.USERS).updateOne({ _id: uid }, { $set: { avatar: null } }, { session });
                if (queryResult.matchedCount < 1) {
                    throw new Error('Error in updating user');
                }

                const avatarPath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.USERS(uid.toHexString()), 'avatar.jpg');
                if (await exists(avatarPath)) {
                    await unlink(avatarPath);
                }
            });

            res.send();
        });
    });

}