import { Router, Request } from 'express';
import * as path from 'path';

import { DBBookDocument, DBLibraryDocument } from '@/types';
import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibraries, ApiGetLibrariesLid, ApiPatchLibrariesLidBody, ApiPostLibrariesBody, ApiPostLibrariesResult, ApiPutLibrariesLidBody } from '@/types/api/users/libraries';
import { DBCollections } from '@/types/database/collections';
import { ReqAuthenticated, ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import { exists, unlink } from '@/utils/fs-async';

import CONFIG from '@/config';

import { purgePatchLibraries, purgePostLibraries, purgePutLibraries, validatePatchLibraries, validatePostOrPutLibraries } from './utils';

export function route(router: Router): void {

    router.get('/users/:uid/libraries', auth('uid'), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const libraries = await dbQuery<ApiGetLibraries>(async db => {
                return db.collection(DBCollections.LIBRARIES).find({ owners: user._id }).toArray();
            });
            res.send(libraries);
        });
    });

    router.get('/users/:uid/libraries/:lid', auth('uid'), validateDbId('lid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;
            const library = await dbQuery<ApiGetLibrariesLid>(async db => {
                return db.collection(DBCollections.LIBRARIES).findOne({ _id: lid, owners: user._id });
            });

            if (!library) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(library);
        });
    });

    router.post('/users/:uid/libraries', auth('uid'), validate(validatePostOrPutLibraries), purge(purgePostLibraries), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const body: ApiPostLibrariesBody = req.body;
            const lid = await dbQuery<ApiPostLibrariesResult>(async db => {
                const queryResult = await db.collection(DBCollections.LIBRARIES).insertOne({ ...body, owners: [user._id] });
                return queryResult?.insertedId?.toHexString();
            });

            if (!lid) {
                throw new Error('Error in database insert');
            }
            
            res.send(lid);
        });
    });

    router.put('/users/:uid/libraries/:lid', auth('uid'), validateDbId('lid'), validate(validatePostOrPutLibraries), purge(purgePutLibraries), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;
            const body: ApiPutLibrariesLidBody = req.body;

            await dbQuery<unknown>(async db => {
                const oldLibrary: DBLibraryDocument = await db.collection(DBCollections.LIBRARIES).findOne({ _id: lid, owners: user._id });
                await db.collection(DBCollections.LIBRARIES).replaceOne({ _id: lid, owners: user._id }, { ...body, owners: oldLibrary.owners, schema: oldLibrary.schema }, { upsert: true });
            });

            res.send();
        });
    });

    router.patch('/users/:uid/libraries/:lid', auth('uid'), validateDbId('lid'), validate(validatePatchLibraries), purge(purgePatchLibraries), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;
            const body: ApiPatchLibrariesLidBody = req.body;

            const updated = await dbQuery<boolean>(async db => {
                const result = await db.collection(DBCollections.LIBRARIES).updateOne({ _id: lid, owners: user._id }, { $set: body }, { upsert: false });
                return result.matchedCount > 0;
            });

            if (!updated) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send();
        });
    });

    router.delete('/users/:uid/libraries/:lid', auth('uid'), validateDbId('lid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;
            
            await dbTransaction<unknown>(async (db, session) => {
                const queryResult = await db.collection(DBCollections.LIBRARIES).findOneAndDelete({ _id: lid, owners: user._id }, { session });
                const library: DBLibraryDocument = queryResult.value;
                const deleted = !!library;

                if (deleted) {
                    for (const resource of library.schema.resources) {
                        try {
                            const resourcePath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_SCHEMA(lid.toHexString()), resource);
                            if (await exists(resourcePath)) {
                                await unlink(resourcePath);
                            }
                        }
                        catch (error) { }
                    }
                    
                    const books: DBBookDocument[] = await db.collection(DBCollections.BOOKS).find({ libraryId: lid }, { session }).toArray();
                    await db.collection(DBCollections.BOOKS).deleteMany({ libraryId: lid }, { session });
                    
                    for (const book of books) {

                        for (const picture of book.pictures) {
                            try {
                                const picturePath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_BOOKS(lid.toHexString(), book._id), picture);
                                if (await exists(picturePath)) {
                                    await unlink(picturePath);
                                }
                            }
                            catch (error) { }
                        }
                    }

                    await db.collection(DBCollections.LABELS).deleteMany({ libraryId: lid }, { session });
                }
            });

            res.send();
        });
    });

    router.put('/users/:uid/libraries/:lid/co-own/:fid', auth('uid'), validateDbId(['lid', 'uid', 'fid']), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const { uid, lid, fid } = req.idParams;

            const friendExists = await dbQuery<boolean>(async db => {
                const friendCount = await db.collection(DBCollections.USERS).countDocuments({ _id: fid });
                return friendCount > 0;
            });
            if (!friendExists) {
                const err: ApiError = {
                    message: 'Friend does not exist',
                    code: ApiErrorCode.FRIEND_DOES_NOT_EXIST
                };
                res.status(404).send(err);
                return;
            }

            const updated = await dbQuery<boolean>(async db => {
                const updateResult = await db.collection(DBCollections.LIBRARIES).updateOne({ _id: lid, owners: uid }, { $addToSet: { owners: fid } });
                return updateResult.matchedCount > 0;
            });
            if (!updated) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
            }

            res.send();
        });
    });
}