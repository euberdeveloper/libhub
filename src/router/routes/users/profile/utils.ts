/* eslint-disable @typescript-eslint/indent */
import * as Joi from 'joi';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { ApiPatchUsersUidProfileBody, ApiPatchUsersUidProfilePassowrdBody, ApiPutUsersUidProfileBody } from '@/types/api/users/profile';

export function validatePutProfile(body: any): boolean {
    const schema = Joi.object({
        name: Joi
            .string()
            .min(1)
            .max(1000)
            .required(),

        surname: Joi
            .string()
            .min(1)
            .max(1000)
            .required()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgePutProfile(body: ApiPatchUsersUidProfileBody): ApiPatchUsersUidProfileBody {
    return {
        name: body.name,
        surname: body.surname
    };
}

export function validatePatchProfile(body: any): boolean {
    const schema = Joi.object({
        name: Joi
            .string()
            .min(1)
            .max(1000)
            .optional(),

        surname: Joi
            .string()
            .min(1)
            .max(1000)
            .optional()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgePatchProfile(body: ApiPatchUsersUidProfileBody): ApiPatchUsersUidProfileBody {
    return Object.keys(body)
        .filter(key => [
            'name',
            'surname'
        ].includes(key))
        .reduce<ApiPatchUsersUidProfileBody>((acc, curr) => ({...acc, [curr]: body[curr]}), {});
}

export function validatePutProfilePassword(body: any): boolean {
    const schema = Joi.object({
        password: Joi
            .string()
            .allow(null)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,23}$/)
            .required()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgePutProfilePassword(body: ApiPatchUsersUidProfilePassowrdBody): ApiPatchUsersUidProfilePassowrdBody {
    function hashPassword(password: string): string {
        const salt = bcrypt.genSaltSync();
        return bcrypt.hashSync(password, salt);     
    }
    
    return {
       password: hashPassword(body.password)
    };
}