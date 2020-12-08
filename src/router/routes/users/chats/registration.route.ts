import { Router, Request } from 'express';

import { ApiError, ApiErrorCode } from '@/types/api/error';
import { ReqAuthenticated } from '@/types/routes';
import { DBCollections } from '@/types/database/collections';

import { dbId, dbQuery } from '@/utils/database';
import { validate, purge, auth, validateDbId } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';

import { purgeCreateChat, purgeCreateMessage, validateCreateChat, validateCreateMessage } from './utils';

import { ApiGetUsersUidChatsCidResult, ApiGetUsersUidChatsResult, ApiPostUsersUidChatsBody, ApiPostUsersUidChatsCidBody, ReqIdParams } from '@/types';
import { DBChat, DBChatMessage } from '@/types/database/chat';

export function route(router: Router): void {

    

    




}