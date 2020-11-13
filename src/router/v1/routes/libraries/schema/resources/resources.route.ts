import { Router, Request } from 'express';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

import { DBLibraryDocument } from '@/types';
import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibrariesLidSchemaResources, ApiPostLibrariesLidSchemaResourcesBody, ApiPostLibrariesLidSchemaResourcesResult } from '@/types/api/libraries/schema/resources';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { upload, validateDbId } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import { rename, mkdir, unlink } from '@/utils/fs-async';

import CONFIG from '@/config';

export function route(router: Router): void {

    router.get('/libraries/:lid/schema/resources', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;

            const resources = await dbQuery<ApiGetLibrariesLidSchemaResources>(async db => {
                const library: DBLibraryDocument | null = await db.collection(DBCollections.LIBRARIES).findOne({ _id: lid });
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

    router.post('/libraries/:lid/schema/resources', upload(CONFIG.UPLOAD.TEMP_LOCATIONS.LIBRARIES_SCHEMA, 'resource'), validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
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
            
            const fileName = await dbTransaction<string>(async (db, session) => {
                const resourceId = uuid();
                const resourceName = `${resourceId}.jpg`;
                const resourcePath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_SCHEMA(lid.toHexString()), resourceName);

                const queryBody = { $push: { 'schema.resources': resourceName } };
                const queryResult = await db.collection(DBCollections.LIBRARIES).updateOne({ _id: lid }, queryBody, { session });

                if (queryResult.matchedCount < 1) {
                    throw new Error('Error in updating library');
                }

                const tempPath = req.file.path;
                await mkdir(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_SCHEMA(lid.toHexString()), { recursive: true });
                await rename(tempPath, resourcePath);

                return resourceName;
            });

            res.send(fileName);
        });
    });
    
    router.delete('/libraries/:lid/schema/resources/:resource', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const resource = req.params.resource;
            
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

            await dbTransaction<void>(async (db, session) => {
                const queryResult = await db.collection(DBCollections.LIBRARIES).updateOne({ _id: lid }, { $pull: { resources: resource } }, { session });
                if(queryResult.modifiedCount < 1) {
                    throw new Error('Error in updating library');
                }

                const resourcePath = path.join(CONFIG.UPLOAD.STORED_LOCATIONS.LIBRARIES_SCHEMA(lid.toHexString()), resource);
                await unlink(resourcePath);
            });

            res.send();
        });
    });
 
}