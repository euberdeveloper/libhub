import { Router, Request } from 'express';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

import { DBBookDocument } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ApiGetLibrariesLidBooks, ApiGetLibrariesLidBooksBid, ApiPatchLibrariesLidBooksBidBody, ApiPostLibrariesLidBooksBody, ApiPostLibrariesLidBooksResult, ApiPutLibrariesLidBooksBidBody } from '@/types/api/users/libraries/books';
import { DBCollections } from '@/types/database/collections';
import { ReqAuthenticated, ReqIdParams } from '@/types/routes';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, validateDbId, deserializeDates, upload, auth } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import { rename, mkdir, exists, unlink } from '@/utils/fs-async';

import CONFIG from '@/config';

import { validatePostOrPutBooks, purgePostBooks, purgePutBooks, validatePatchBooks, purgePatchBooks } from './utils';

export function route(router: Router): void {

    
   

}