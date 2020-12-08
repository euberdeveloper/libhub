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



}