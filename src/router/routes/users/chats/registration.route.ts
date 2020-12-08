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

    router.get('/users/:uid/chats/:cid', auth('uid'), validateDbId('cid'), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const cid = req.idParams.cid;

            const chat = await dbQuery<ApiGetUsersUidChatsCidResult>(async db => {
                const chat: DBChat = await db.collection(DBCollections.CHATS).findOne({ _id: cid, users: user._id });
                if (!chat) {
                    throw new Error('Chat not found');
                }

                const messages: DBChatMessage[] = await db.collection(DBCollections.CHAT_MESSAGES).find({ chatId: cid }).toArray();

                return {
                    ...chat,
                    messages: messages
                };
            });

            res.send(chat);
        });
    });

    router.post('/users/:uid/chats/:cid', auth('uid'), validateDbId('cid'), validate(validateCreateMessage), purge(purgeCreateMessage), async (req: Request & ReqAuthenticated & ReqIdParams, res) => {
        await aceInTheHole(res, async () => {
            const user = req.user;
            const body: ApiPostUsersUidChatsCidBody = req.body;
            const cid = req.idParams.cid;

            const chat = await dbQuery<DBChat>(async db => {
                return db.collection(DBCollections.CHATS).findOne({ _id: cid, users: user._id });
            });

            if (!chat) {
                const error: ApiError = {
                    message: 'Provided id not found',
                    code: ApiErrorCode.PROVIDED_ID_NOT_FOUND
                };
                res.status(404).send(error);
                return;
            }

            await dbQuery(async db => {
                const message: Omit<DBChatMessage, '_id'> = {
                    author: user._id,
                    chatId: cid as any,
                    date: new Date(),
                    text: body.text,
                    visualized: false
                };

                await db.collection(DBCollections.CHAT_MESSAGES).insertOne(message);
            });

            res.send(chat);
        });
    });



}