import { Router, Request } from 'express';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

import { DBBookDocument } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibrariesLidBooks, ApiGetLibrariesLidBooksBid, ApiPatchLibrariesLidBooksBidBody, ApiPostLibrariesLidBooksBody, ApiPostLibrariesLidBooksResult, ApiPutLibrariesLidBooksBidBody } from '@/types/api/users/libraries/books';
import { DBCollections } from '@/types/database/collections';
import { ReqAuthenticated, ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, deserializeDates, upload, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import { rename, mkdir, exists, unlink } from '@/utils/fs-async';

import CONFIG from '@/config';

import { validatePostOrPutBooks, purgePostBooks, purgePutBooks, validatePatchBooks, purgePatchBooks } from './utils';

export function route(router: Router): void {

    router.get('/users/:uid/libraries/:lid/books', auth('uid'), validateDbId('lid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const books = await dbQuery<ApiGetLibrariesLidBooks>(async db => {
                return db.collection(DBCollections.BOOKS).find({ libraryId: lid.toHexString() }).toArray();
            });

            res.send(books);
        });
    });
 
    router.get('/users/:uid/libraries/:lid/books/:bid', auth('uid'), validateDbId(['lid', 'bid']), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const { lid, bid } = req.idParams;
            
            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const book = await dbQuery<ApiGetLibrariesLidBooksBid>(async db => {
                return db.collection(DBCollections.BOOKS).findOne({ _id: bid, libraryId: lid.toHexString() });
            });

            if (!book) {
                const err: ApiError = {
                    message: 'Book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(book);
        });
    });

    router.post('/users/:uid/libraries/:lid/books', auth('uid'), validateDbId('lid'), deserializeDates(['publicationYear']), validate(validatePostOrPutBooks), purge(purgePostBooks), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: user._id });
                return library > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            const body: ApiPostLibrariesLidBooksBody = req.body;
            const bid = await dbQuery<ApiPostLibrariesLidBooksResult>(async db => {
                const book: Omit<DBBookDocument, '_id'> = { ...body, libraryId: lid.toHexString() };
                const queryResult = await db.collection(DBCollections.BOOKS).insertOne(book);
                return queryResult?.insertedId?.toHexString();
            });

            if (!bid) {
                throw new Error('Error in database insert');
            }
            
            res.send(bid);
        });
    });

    router.post('/users/:uid/libraries/:lid/books/:bid/pictures', auth('uid'), upload(CONFIG.UPLOAD.TEMP_LOCATIONS.LIBRARIES_BOOKS, 'picture'), validateDbId(['lid', 'bid']), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const { lid, bid } = req.idParams;
            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid, owners: [user._id]});
                const book = await db.collection(DBCollections.BOOKS).countDocuments({ _id: bid, libraryId: lid.toHexString() });
                return book > 0 && library > 0;
            });

            if (!found) {
                const err: ApiError = {
                    message: 'Book or library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }
            
            const result = await dbTransaction<string>(async (db, session) => {
                const pictureId = uuid();
                const pictureName = `${pictureId}.jpg`;
                const picturePath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_BOOKS(lid.toHexString(), bid.toHexString()), pictureName);

                const result = `${CONFIG.SERVER.HOSTNAME}/stored/libraries/${lid.toHexString()}/books/${bid.toHexString()}/${pictureName}`;

                const queryBody = { $push: { pictures: result } };
                const queryResult = await db.collection(DBCollections.BOOKS).updateOne({ _id: bid, libraryId: lid.toHexString() }, queryBody, { session });

                if (queryResult.matchedCount < 1) {
                    throw new Error('Error in updating book');
                }

                const tempPath = req.file.path;
                await mkdir(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_BOOKS(lid.toHexString(), bid.toHexString()), { recursive: true });
                await rename(tempPath, picturePath);

                return result;
            });

            res.send(result);
        });
    });
    
    

}