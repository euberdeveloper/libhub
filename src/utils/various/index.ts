import { Response } from 'express';
import { ApiError, ApiErrorCode } from '@/types/api';

export function stringifyError(error: any): string {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
}

export async function aceInTheHole(res: Response, task: () => Promise<any>, message: string = 'Internal server error'): Promise<void> {
    try {
        await task();
    }
    catch (error) {
        console.error(error);
        const err: ApiError = {
            message,
            code: ApiErrorCode.INTERNAL_SERVER_ERROR
        };
        res.status(500).send(err);
    }
}