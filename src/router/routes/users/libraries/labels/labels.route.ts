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


}