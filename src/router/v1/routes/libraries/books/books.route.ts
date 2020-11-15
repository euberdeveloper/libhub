import { Router, Request } from 'express';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

import { DBBookDocument } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibrariesLidBooks, ApiGetLibrariesLidBooksBid, ApiPatchLibrariesLidBooksBidBody, ApiPostLibrariesLidBooksBody, ApiPostLibrariesLidBooksResult, ApiPutLibrariesLidBooksBidBody } from '@/types/api/libraries/books';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, deserializeDates, upload } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import { rename, mkdir, exists, unlink } from '@/utils/fs-async';

import CONFIG from '@/config';

import { validatePostOrPutBooks, purgePostBooks, purgePutBooks, validatePatchBooks, purgePatchBooks } from './utils';

export function route(router: Router): void {

    router.get('/libraries/:lid/books', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid });
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

            res.send(books as ApiGetLibrariesLidBooks);
        });
    });

    router.get('/libraries/:lid/books/:bid', validateDbId(['lid', 'bid']), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const { lid, bid } = req.idParams;

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

    router.post('/libraries/:lid/books', validateDbId('lid'), deserializeDates(['publicationYear']), validate(validatePostOrPutBooks), purge(purgePostBooks), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid });
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

    router.post('/libraries/:lid/books/:bid/pictures', upload(CONFIG.UPLOAD.TEMP_LOCATIONS.LIBRARIES_BOOKS, 'picture'), validateDbId(['lid', 'bid']), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const { lid, bid } = req.idParams;
            const found = await dbQuery<boolean>(async db => {
                const book = await db.collection(DBCollections.BOOKS).countDocuments({ _id: bid, libraryId: lid.toHexString() });
                return book > 0;
            });

            if (!found) {
                const err: ApiError = {
                    message: 'Book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }
            
            const fileName = await dbTransaction<string>(async (db, session) => {
                const pictureId = uuid();
                const pictureName = `${pictureId}.jpg`;
                const picturePath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_BOOKS(lid.toHexString(), bid.toHexString()), pictureName);

                const queryBody = { $push: { pictures: pictureName } };
                const queryResult = await db.collection(DBCollections.BOOKS).updateOne({ _id: bid, libraryId: lid.toHexString() }, queryBody, { session });

                if (queryResult.matchedCount < 1) {
                    throw new Error('Error in updating book');
                }

                const tempPath = req.file.path;
                await mkdir(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_BOOKS(lid.toHexString(), bid.toHexString()), { recursive: true });
                await rename(tempPath, picturePath);

                return pictureName;
            });

            res.send(fileName);
        });
    });

    router.put('/libraries/:lid/books/:bid', validateDbId(['lid', 'bid']), deserializeDates(['publicationYear']), validate(validatePostOrPutBooks), purge(purgePutBooks), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const { lid, bid } = req.idParams;
            const body: ApiPutLibrariesLidBooksBidBody = req.body;

            const found = await dbQuery<boolean>(async db => {
                const library = await db.collection(DBCollections.LIBRARIES).countDocuments({ _id: lid });
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

            await dbQuery<void>(async db => {
                const oldBook: DBBookDocument | null = await db.collection(DBCollections.BOOKS).findOne({ _id: bid, libraryId: lid.toHexString() });
                const newBook: Omit<DBBookDocument, '_id'> = { ...body, libraryId: lid.toHexString(), pictures: oldBook ? oldBook.pictures : [] };
                await db.collection(DBCollections.BOOKS).replaceOne({ _id: bid, libraryId: lid.toHexString() }, newBook, { upsert: true });
            });

            res.send();
        });
    });

    router.patch('/libraries/:lid/books/:bid', validateDbId(['lid', 'bid']), deserializeDates(['publicationYear']), validate(validatePatchBooks), purge(purgePatchBooks), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const { lid, bid } = req.idParams;
            const body: ApiPatchLibrariesLidBooksBidBody = req.body;

            const updated = await dbQuery<boolean>(async db => {
                const result = await db.collection(DBCollections.BOOKS).updateOne({ _id: bid, libraryId: lid.toHexString() }, { $set: body }, { upsert: false });
                return result.matchedCount > 0;
            });

            if (!updated) {
                const err: ApiError = {
                    message: 'Book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send();
        });
    });

    router.delete('/libraries/:lid/books/:bid', validateDbId(['lid', 'bid']), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const { lid, bid } = req.idParams;
            const found = await dbQuery<boolean>(async db => {
                const book = await db.collection(DBCollections.BOOKS).countDocuments({ _id: bid, libraryId: lid.toHexString() });
                return book > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            await dbTransaction<void>(async (db, session) => {
                const queryResult = await db.collection(DBCollections.BOOKS).findOneAndDelete({ _id: bid, libraryId: lid.toHexString() }, { session });
                const book: DBBookDocument = queryResult.value;

                if(!book) {
                    throw new Error('Error in deleting book');
                }

                for (const pictureName of book.pictures) {
                    const picturePath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_BOOKS(lid.toHexString(), bid.toHexString()), pictureName);
                    if (await exists(picturePath)) {
                        await unlink(picturePath);
                    }
                }


            });

            res.send();
        });xxxx
    });

    router.delete('/libraries/:lid/books/:bid/pictures/:picture', validateDbId(['lid', 'bid']), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const { lid, bid } = req.idParams;
            const picture = req.params.picture;

            const found = await dbQuery<boolean>(async db => {
                const book = await db.collection(DBCollections.BOOKS).countDocuments({ _id: bid, libraryId: lid.toHexString() });
                return book > 0;
            });
            if (!found) {
                const err: ApiError = {
                    message: 'Book not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            await dbTransaction<void>(async (db, session) => {
                const queryResult = await db.collection(DBCollections.BOOKS).updateOne({ _id: bid, libraryId: lid.toHexString() }, { $pull: { pictures: picture } }, { session });
                if(queryResult.modifiedCount < 1) {
                    throw new Error('Error in updating book');
                }

                const picturePath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_BOOKS(lid.toHexString(), bid.toHexString()), picture);
                await unlink(picturePath);
            });

            res.send();
        });
    });

}