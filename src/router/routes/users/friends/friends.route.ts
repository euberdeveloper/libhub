import { Router, Request } from 'express';

import { ApiPostUserUidFriendsFriendRequestsReceivedBody, ApiPostUserUidFriendsUsernameBody } from '@/types/api/users/friends';
import { ApiError, ApiErrorCode } from '@/types/api/error';
import { DBUser } from '@/types/database/user';
import { DBCollections } from '@/types/database/collections';
import { DBFriendRequest, ReqAuthenticated, ReqIdParams } from '@/types';

import { dbQuery, dbTransaction } from '@/utils/database';
import { validate, purge, auth, validateDbId } from '@/utils/middlewares';
import { aceInTheHole } from '@/utils/various';


import { purgeFriendRequest, purgeFriendRequestResponse, validateFriendRequest, validateFriendRequestResponse } from './utils';

export function route(router: Router): void {

    



}