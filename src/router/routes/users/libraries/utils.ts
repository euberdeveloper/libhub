/* eslint-disable @typescript-eslint/indent */
import * as Joi from 'joi';

import { ApiPatchLibrariesLidBody, ApiPostLibrariesBody, ApiPutLibrariesLidBody } from '@/types/api/users/libraries';

export function validatePostOrPutLibraries(body: any): boolean {
    const schema = Joi.object({
        name: Joi
            .string()
            .min(1)
            .max(1000)
            .required()        
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgePostLibraries(body: ApiPostLibrariesBody): ApiPostLibrariesBody {
    return {
        name: body.name,
        owners: [],
        schema: {
            resources: [],
            ubications: []
        }
    };
}

export function purgePutLibraries(body: ApiPutLibrariesLidBody): ApiPutLibrariesLidBody {
    return {
        name: body.name
    };
}

export function validatePatchLibraries(body: any): boolean {
    const schema = Joi.object({
        name: Joi
            .string()
            .min(1)
            .max(1000)
            .optional()        
    })
    .required()
    .unknown();
   
    return schema.validate(body).error === undefined;
}

export function purgePatchLibraries(body: ApiPatchLibrariesLidBody): ApiPatchLibrariesLidBody {
    return Object.keys(body)
        .filter(key => [
            'name'
        ].includes(key))
        .reduce<ApiPatchLibrariesLidBody>((acc, curr) => ({...acc, [curr]: body[curr]}), {});
}
