import { Router, Request } from 'express';

import { DBLibraryDocument } from '@/types';
import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibrariesLidSchemaUbications, ApiPostLibrariesLidSchemaUbicationsBody } from '@/types/api/libraries/schema/ubications';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams } from '@/types/routes';

import { dbQuery } from '@/utils/database';
import { purge, validate, validateDbId } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';

import { purgePostUbications, validatePostUbications } from './utils';

export function route(router: Router): void {

    router.get('/libraries/:lid/schema/ubications', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;

            const ubications = await dbQuery<ApiGetLibrariesLidSchemaUbications>(async db => {
                const library: DBLibraryDocument | null = await db.collection(DBCollections.LIBRARIES).findOne({ _id: lid });
                return library?.schema.ubications;
            });

            if (!ubications) {
                const err: ApiError = {
                    message: 'Library not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(ubications);
        });
    });

    router.post('/libraries/:lid/schema/ubications', validateDbId('lid'), validate(validatePostUbications), purge(purgePostUbications), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const body: ApiPostLibrariesLidSchemaUbicationsBody = req.body;

            const updated = await dbQuery<boolean>(async db => {
                const queryBody = { $addToSet: { 'schema.ubications': body.ubication } };
                const queryResult = await db.collection(DBCollections.LIBRARIES).updateOne({ _id: lid }, queryBody);
                return queryResult.matchedCount > 0;
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

    router.delete('/libraries/:lid/schema/ubications/:ubication', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const ubication = req.params.ubication;

            const deleted = await dbQuery<boolean>(async db => {
                const queryBody = { $pull: { 'schema.ubications': ubication } };
                const queryResult = await db.collection(DBCollections.LIBRARIES).updateOne({ _id: lid }, queryBody);
                return queryResult.matchedCount > 0;
            });

            if (!deleted) {
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
 
}