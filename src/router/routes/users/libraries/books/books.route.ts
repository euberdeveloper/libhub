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

    

}