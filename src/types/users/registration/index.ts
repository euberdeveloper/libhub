import { DBUser } from '@/types/database/user';

export type ApiPostUsersSignupBody = Omit<DBUser, '_id'>;

export type ApiPostUsersVerifyTokenResult = { user: DBUser; token: string };

export type ApiPostUsersLoginBody = { username: string; password: string };
export type ApiPostUsersLoginResult = { user: DBUser; token: string };