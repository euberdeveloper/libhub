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

    router.post('/users/:uid/friends/:username', auth('uid'), validate(validateFriendRequest), purge(purgeFriendRequest), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const username = req.params.username;
            const body: ApiPostUserUidFriendsUsernameBody = req.body;

            if (user.username === username) {
                const err: ApiError = {
                    message: 'User can not be friend with himself',
                    code: ApiErrorCode.USER_CANNOT_BE_FRIEND_WITH_HIMSELF
                };
                res.status(400).send(err);
                return;
            }

            const friend = await dbQuery<DBUser>(async db => {
                return db.collection(DBCollections.USERS).findOne({ username });
            });

            if (user.friends.find(f => f == friend._id)) {
                const err: ApiError = {
                    message: 'User is already friend',
                    code: ApiErrorCode.USER_IS_ALREADY_FRIEND
                };
                res.status(400).send(err);
                return;
            }

            const alreadyRequest = await dbQuery<boolean>(async db => {
                return db.collection(DBCollections.FRIEND_REQUESTS).findOne({ requestBy: user._id, requestTo: friend._id });
            });

            if (alreadyRequest) {
                const err: ApiError = {
                    message: 'User is already friend',
                    code: ApiErrorCode.USER_IS_ALREADY_FRIEND
                };
                res.status(400).send(err);
                return;
            }

            const inserted = await dbQuery<boolean>(async db => {
                const friendRequest: Omit<DBFriendRequest, '_id'> = {
                    createdOn: new Date(),
                    message: body.message,
                    requestBy: user._id,
                    requestTo: friend._id
                };
                const insertResult = await db.collection(DBCollections.FRIEND_REQUESTS).insertOne(friendRequest);
                return !!insertResult.insertedId;
            });

            if (!inserted) {
                throw new Error('Error in inserting friend request');
            }

            res.send();
        });
    });

    router.get('/users/:uid/friends/friend-requests/sent', auth('uid'), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            
            const friendRequests = await dbQuery<DBFriendRequest[]>(async db => {
                return db.collection(DBCollections.FRIEND_REQUESTS).find({ requestBy: user._id }).toArray();
            });

            res.send(friendRequests);
        });
    });

    router.delete('/users/:uid/friends/friend-requests/sent/:rid', auth('uid'), validateDbId('rid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const rid = req.idParams.rid;
            
            const deleted = await dbQuery<boolean>(async db => {
                const queryResult = await db.collection(DBCollections.FRIEND_REQUESTS).deleteOne({ _id: rid, requestBy: user._id });
                return queryResult.deletedCount > 0;
            });

            if (!deleted) {
                const err: ApiError = {
                    message: 'Provided id not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(err);
                return;
            }

            res.send();
        });
    });

}