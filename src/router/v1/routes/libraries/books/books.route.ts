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
   
}