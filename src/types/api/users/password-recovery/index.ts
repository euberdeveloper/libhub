import { DBUser } from '@/types/database/user';

export type ApiPostUsersUsernamePasswordRecoveryTokenBody = { password: string };
export type ApiPostUsersUsernamePasswordRecoveryTokenResult = { user: DBUser; token: string };