import { DBUser } from '@/types/database/user';

export type ApiPutUsersUidProfileBody = Omit<DBUser, '_id' | 'username' | 'password' | 'email' | 'verified' | 'verificationToken' | 'recoverPasswordToken'>;
export type ApiPatchUsersUidProfileBody = Partial<Omit<DBUser, '_id' | 'username' | 'password' | 'email' | 'verified' | 'verificationToken' | 'recoverPasswordToken'>>;

export type ApiPatchUsersUidProfilePassowrdBody = { password: string };
export type ApiPatchUsersUidProfilePassowrdResult = { token: string };

export type ApiPutUsersUidProfileAvatarBody = FormData;