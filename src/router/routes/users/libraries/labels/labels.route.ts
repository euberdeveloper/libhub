import { Router, Request } from 'express';
import { DBLabelDocument } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLabels, ApiGetLabelsLid, ApiPatchLabelsLidBody, ApiPostLabelsBody, ApiPostLabelsResult, ApiPutLabelsLidBody } from '@/types/api/users/libraries/labels';
import { DBCollections } from '@/types/database/collections';
import { ReqIdParams, ReqAuthenticated } from '@/types/routes';

import { dbId, dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';

import { validatePostOrPutLabels, purgePostLabels, purgePutLabels, validatePatchLabels, purgePatchLabels } from './utils';

export function route(router: Router): void {

    router.get('/user/:uid/libraries/:lid/labels', auth('uid'), validateDbId('uid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const lid = req.idParams;

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

            const labels = await dbQuery<ApiGetLabels>(async db => {
                return db.collection(DBCollections.LABELS).find({ libraryId: lid }).toArray();
            });
            res.send(labels);
        });
    });

    router.get('/user/:uid/libraries/:lid/labels/:id', auth('uid'), validateDbId('lid'), async (req: Request & ReqIdParams & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const { lid, id } = req.idParams;

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

            const label = await dbQuery<ApiGetLabelsLid>(async db => {
                return db.collection(DBCollections.LABELS).findOne({ _id: id, libraryId: lid });
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


}