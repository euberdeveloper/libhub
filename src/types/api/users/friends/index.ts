import { DBUser, DBFriendRequest } from '@/types/database';

export type ApiGetUsersUidFriends = DBUser[];

export type ApiPostUserUidFriendsUsernameBody = { message?: string };

export type ApiGetUsersUidFriendsFriendRequestsSent = DBFriendRequest[];

export type ApiGetUsersUidFriendsFriendRequestsReceived = DBFriendRequest[];

export type ApiPostUserUidFriendsFriendRequestsReceivedBody = { accepted: boolean; message?: string };
