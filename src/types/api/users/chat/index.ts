import { DBChat, DBChatMessage } from '@/types/database/chat';

export type ApiGetUsersUidChatsResult = (DBChat & { newMessages: number })[];
export type ApiGetUsersUidChatsCidResult = DBChat & { messages: DBChatMessage[] };

export type ApiPostUsersUidChatsCidBody = { text: string };
export type ApiPostUsersUidChatsBody = { recipient: string };
export type ApiPostUsersUidChatsResult = string;