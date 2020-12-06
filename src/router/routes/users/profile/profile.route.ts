import { Router, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';

import { ApiPatchUsersUidProfileBody, ApiPatchUsersUidProfilePassowrdBody, ApiPatchUsersUidProfilePassowrdResult, ApiPostUsersLoginBody, ApiPostUsersLoginResult, ApiPostUsersSignupBody, ApiPutUsersUidProfileBody } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ReqAuthenticated } from '@/types/routes';
import { DBUser } from '@/types/database/user';
import { DBCollections } from '@/types/database/collections';

import { dbQuery, dbTransaction, ObjectID } from '@/utils/database';
import { validate, purge, auth, upload } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import { rename, mkdir, exists, unlink } from '@/utils/fs-async';

import { purgePutProfile, validatePutProfile, purgePatchProfile, purgePutProfilePassword, validatePatchProfile, validatePutProfilePassword } from './utils';

import CONFIG from '@/config';

export function route(router: Router): void {

   

}