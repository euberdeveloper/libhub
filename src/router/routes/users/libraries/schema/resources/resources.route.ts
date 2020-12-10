import { Router, Request } from 'express';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

import { DBLibraryDocument } from '@/types';
import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibrariesLidSchemaResources } from '@/types/api/users/libraries/schema/resources';
import { DBCollections } from '@/types/database/collections';
import { ReqAuthenticated, ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { upload, validateDbId, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import { rename, mkdir, unlink } from '@/utils/fs-async';

import CONFIG from '@/config';

export function route(router: Router): void {

    router.get('/users/:uid/libraries/:lid/schema/resources', auth('uid'), validateDbId('lid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams.lid;

            const resources = await dbQuery<ApiGetLibrariesLidSchemaResources>(async db => {
                const library: DBLibraryDocument | null = await db.collection(DBCollections.LIBRARIES).findOne({ _id: lid, owners: user._id });
                return library?.schema.resources;
            });

            if (!resources) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(resources);
        });
    });
 
}