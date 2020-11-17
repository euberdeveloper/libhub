import { Router, Request } from "express";
import { DBLabelDocument } from "@/types";

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLabels, ApiGetLabelsLid, ApiPatchLabelsLidBody, ApiPostLabelsBody, ApiPostLabelsResult, ApiPutLabelsLidBody } from '@/types/api/labels';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams } from '@/types/routes';

import { dbId, dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId } from "@/utils/middlewares";
import { aceInTheHole } from '@/utils/various';

import { validatePostOrPutLabels, purgePostLabels, purgePutLabels, validatePatchLabels, purgePatchLabels } from "./utils";

export function route(router: Router): void {

    router.get('/labels', async (_req, res) => {
        await aceInTheHole(res, async () => {
            const labels = await dbQuery<ApiGetLabels>(async db => {
                return db.collection(DBCollections.LABELS).find().toArray();
            });
            res.send(labels);
        });
    });

    router.get('/labels/:lid', validateDbId('lid'), async (req: Request & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const lid = req.idParams.lid;
            const label = await dbQuery<ApiGetLabelsLid>(async db => {
                return db.collection(DBCollections.LABELS).findOne({ _id: lid });
            });

            if (!label) {
                const err: ApiError = {
                    message: 'Label not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send(label);
        });
    });

    router.post('/labels', validate(validatePostOrPutLabels), purge(purgePostLabels), async (req, res) => {
        await aceInTheHole(res, async () => {
            const body: ApiPostLabelsBody = req.body;
            const lid = await dbQuery<ApiPostLabelsResult>(async db => {
                const queryResult = await db.collection(DBCollections.LABELS).insertOne(body);
                return queryResult?.insertedId?.toHexString();
            });

            if (!lid) {
                throw new Error('Error in database insert');
            }

            res.send(lid);
        });
    });


}