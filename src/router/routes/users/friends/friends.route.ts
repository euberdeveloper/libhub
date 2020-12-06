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

    router.get('/users/usernames', auth(), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            
            const users = await dbQuery<DBUser[]>(async db => {
                return db.collection(DBCollections.USERS).find({ _id: { $ne: user._id } }).project({ _id: true, username: true }).toArray();
            });

            res.send(users);
        });
    });

    router.get('/users/:uid/friends', auth('uid'), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const friendsIds = user.friends;
            const friends = await dbQuery<DBUser[]>(async db => {
                return db.collection(DBCollections.USERS).find({ _id: { $in: friendsIds } }).project({ password: false }).toArray();
            });
            res.send(friends);
        });
    });

    router.delete('/users/:uid/friends/:fid', auth('uid'), validateDbId('fid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const fid = req.idParams.fid;

            await dbTransaction<boolean>(async (db, session) => {
                const updateCurrentResult = await db.collection(DBCollections.USERS).updateOne({ _id: user._id }, { $pull: { friends: fid } }, { session });
                const updateOther = await db.collection(DBCollections.USERS).updateOne({ _id: fid }, { $pull: { friends: user._id } }, { session });
                return updateCurrentResult.matchedCount > 0 && updateOther.matchedCount > 0;
            });

            res.send();
        });
    });


}