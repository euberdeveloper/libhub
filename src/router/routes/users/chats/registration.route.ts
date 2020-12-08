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

    router.get('/users/:uid/chats', auth('uid'), async (req: Request & ReqAuthenticated, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;

            const chats = await dbQuery<ApiGetUsersUidChatsResult>(async db => {
                const chats = await db.collection(DBCollections.CHATS).find({ users: user._id }).toArray();
                for (const chat of chats) {
                    const newMessages = await db.collection(DBCollections.CHAT_MESSAGES).countDocuments({ _id: chat._id, author: { $ne: user._id }, visualized: false });
                    chat.newMessages = newMessages;
                }
                return chats;
            });

            res.send(chats);
        });
    });

    




}