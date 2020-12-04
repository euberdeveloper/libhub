import { DBDocument } from '..';

export interface DBUser extends DBDocument {
    username: string;
    password: string;
    email: string;
    name: string;
    surname: string;
    verified: boolean;
    verificationToken: string | null;
    recoverPasswordToken: string | null;
    avatar: string | null;
    friends: string[];
}