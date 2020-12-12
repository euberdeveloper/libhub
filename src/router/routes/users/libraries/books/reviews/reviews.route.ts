import { Router, Request } from 'express';

import { DBBookReview } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetUsersUidLibrariesLidBooksBidReviews, ApiPostUsersUidLibrariesLidBooksBidReviewsBody, ApiGetUsersUidLibrariesLidBooksBidReviewsRid, ApiPostUsersUidLibrariesLidBooksBidReviewsResult } from '@/types/api/users/libraries/books/reviews';
import { DBCollections } from '@/types/database/collections';
import { ReqAuthenticated, ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';

import { purgeCreateReview, validateCreateReview } from './utils';

export function route(router: Router): void {


}