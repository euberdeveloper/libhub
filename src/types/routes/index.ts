import { ObjectID } from 'mongodb';

export interface ReqIdParams {
    idParams: { [key: string]: ObjectID }
}