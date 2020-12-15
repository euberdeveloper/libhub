import { MongoClient, Db, ClientSession, TransactionOptions, ObjectID } from 'mongodb';
import CONFIG from '@/config';

export { ObjectID } from 'mongodb';

/**
 * Executes a db query, automitizing the connection to the db and passing the db as parameter of a callback
 * @param callback A callback with the db already taken
 * @returns A promise to the result of the callback
 */
export async function dbQuery<ResultType>(callback: (db: Db) => Promise<ResultType>): Promise<ResultType> {
    const connection = await MongoClient.connect(CONFIG.MONGO.URI, CONFIG.MONGO.OPTIONS);
    const db = connection.db(CONFIG.MONGO.DB);

    let result: ResultType | null = null;
    let error: any;

    try {
        result = await callback(db);
    }
    catch (err) {
        error = err;
    }
    finally {
        await connection.close();

        if (error) {
            throw error;
        }
        else {
            return result;
        }
    }
}

/**
 * Executes a db transaction, automitizing the connection to the db and passing the db and the transaction session as parameters of a callback
 * @param callback A callback with the db already taken
 * @returns A promise to the result of the callback
 */
export async function dbTransaction<ResultType>(callback: (db: Db, session: ClientSession) => Promise<ResultType>): Promise<ResultType> {
    const connection = await MongoClient.connect(CONFIG.MONGO.URI, CONFIG.MONGO.OPTIONS);
    const db = connection.db(CONFIG.MONGO.DB);
    const session = connection.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    let result: ResultType | null = null;
    let error: any;

    try {
        await session.withTransaction(async () => {
            result = await callback(db, session);
        }, transactionOptions);
    }
    catch (err) {
        error = err;
    }
    finally {
        await session.endSession();
        await connection.close();

        if (error) {
            throw error;
        }
        else {
            return result;
        }
    }
}

/**
 * Transforms a string to an ObjectID
 * @param _id The id to transform
 * @returns The objectID
 */
export function dbId(_id: string): ObjectID {
    return new ObjectID(_id);
}