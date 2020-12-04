import { Router, Request } from "express";
import * as path from 'path';

import { DBBookDocument, DBLibraryDocument } from "@/types";
import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibraries, ApiGetLibrariesLid, ApiPatchLibrariesLidBody, ApiPostLibrariesBody, ApiPostLibrariesResult, ApiPutLibrariesLidBody } from '@/types/api/libraries';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId } from "@/utils/middlewares";
import { aceInTheHole } from '@/utils/various';
import { exists, unlink } from '@/utils/fs-async';

import CONFIG from '@/config';

import { purgePatchLibraries, purgePostLibraries, purgePutLibraries, validatePatchLibraries, validatePostOrPutLibraries } from "./utils";

export function route(router: Router): void {

    router.get('/libraries', async (_req, res) => {
        await aceInTheHole(res, async () => {
            const libraries = await dbQuery<ApiGetLibraries>(async db => {
                return db.collection(DBCollections.LIBRARIES).find().toArray();
            });
            res.send(libraries);
        });
    });

    router.get('/libraries/:lid', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const library = await dbQuery<ApiGetLibrariesLid>(async db => {
                return db.collection(DBCollections.LIBRARIES).findOne({ _id: lid });
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

    router.post('/libraries', validate(validatePostOrPutLibraries), purge(purgePostLibraries), async (req, res) => {
        await aceInTheHole(res, async () => {
            const body: ApiPostLibrariesBody = req.body;
            const lid = await dbQuery<ApiPostLibrariesResult>(async db => {
                const queryResult = await db.collection(DBCollections.LIBRARIES).insertOne(body);
                return queryResult?.insertedId?.toHexString();
            });

            if (!lid) {
                throw new Error('Error in database insert');
            }
            
            res.send(lid);
        });
    });

    router.put('/libraries/:lid', validateDbId('lid'), validate(validatePostOrPutLibraries), purge(purgePutLibraries), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const body: ApiPutLibrariesLidBody = req.body;

            await dbQuery<void>(async db => {
                const oldLibrary: DBLibraryDocument = await db.collection(DBCollections.LIBRARIES).findOne({ _id: lid });
                await db.collection(DBCollections.LIBRARIES).replaceOne({ _id: lid }, { ...body, owners: oldLibrary.owners, schema: oldLibrary.schema }, { upsert: true });
            });

            res.send();
        });
    });

    router.patch('/libraries/:lid', validateDbId('lid'), validate(validatePatchLibraries), purge(purgePatchLibraries), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const body: ApiPatchLibrariesLidBody = req.body;

            const updated = await dbQuery<boolean>(async db => {
                const result = await db.collection(DBCollections.LIBRARIES).updateOne({ _id: lid }, { $set: body }, { upsert: false });
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

    router.delete('/libraries/:lid', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            await dbTransaction<void>(async (db, session) => {
                const queryResult = await db.collection(DBCollections.LIBRARIES).findOneAndDelete({ _id: lid }, { session });
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
                }
            });

            res.send();
        });
    });
}