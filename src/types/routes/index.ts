import { ObjectID } from 'mongodb';
import { DBUser } from '..';

export interface ReqIdParams {
    idParams: { [key: string]: ObjectID };
}

export interface ReqAuthenticated {
    user: DBUser;
}