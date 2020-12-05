import { Router } from 'express';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { ApiPostUsersUsernamePasswordRecoveryTokenBody, ApiPostUsersUsernamePasswordRecoveryTokenResult } from '@/types';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { DBUser } from '@/types/database/user';
import { DBCollections } from '@/types/database/collections';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';
import * as mailer from '@/utils/mailer';

import CONFIG from '@/config';

import { validateRecovery, purgeRecovery } from './utils';

export function route(router: Router): void {

    
    



}