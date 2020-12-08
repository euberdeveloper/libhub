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

    


}