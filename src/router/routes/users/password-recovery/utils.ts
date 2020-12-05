/* eslint-disable @typescript-eslint/indent */
import * as Joi from 'joi';
import * as bcrypt from 'bcrypt';

import { ApiPostUsersUsernamePasswordRecoveryTokenBody } from '@/types/api/users/password-recovery';

export function validateRecovery(body: any): boolean {
    const schema = Joi.object({
        password: Joi
            .string()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,23}$/)
            .required()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgeRecovery(body: ApiPostUsersUsernamePasswordRecoveryTokenBody): ApiPostUsersUsernamePasswordRecoveryTokenBody {
    function hashPassword(password: string): string {
        const salt = bcrypt.genSaltSync();
        return bcrypt.hashSync(password, salt);     
    }
    
    return {
       password: hashPassword(body.password)
    };
}