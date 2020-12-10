import { Router, Request } from 'express';

import { DBLibraryDocument } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibrariesLidSchema } from '@/types/api/users/libraries/schema';
import { DBCollections } from '@/types/database/collections';
import { ReqAuthenticated, ReqIdParams } from '@/types/routes';

import { dbQuery } from '@/utils/database';
import { validateDbId, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';

export function route(router: Router): void {

    router.get('/users/:uid/libraries/:lid/schema', auth('uid'), validateDbId('lid'), async(req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async() => {
            const user = req.user;
            const lid = req.idParams.lid;

            const schema = await dbQuery<ApiGetLibrariesLidSchema>(async db => {
                const library: DBLibraryDocument | null = await db.collection(DBCollections.LIBRARIES).findOne({ _id: lid, userId: user._id });
                return library?.schema;
            });

            if (!schema) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(schema);
        });
    });
 
}