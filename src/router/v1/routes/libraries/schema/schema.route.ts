import { Router, Request } from 'express';

import { DBLibraryDocument } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibrariesLidSchema } from '@/types/api/libraries/schema';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams } from '@/types/routes';

import { dbQuery } from '@/utils/database';
import { validateDbId } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';

export function route(router: Router): void {

    router.get('/libraries/:lid/schema', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;

            const schema = await dbQuery<ApiGetLibrariesLidSchema>(async db => {
                const library: DBLibraryDocument | null = await db.collection(DBCollections.LIBRARIES).findOne({ _id: lid });
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