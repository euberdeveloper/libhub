import * as Joi from 'joi';

import { ApiPostLibrariesLidSchemaUbicationsBody } from '@/types/api/libraries/schema/ubications';

export function validatePostUbications(body: any): boolean {
    const schema = Joi.object({
        ubication: Joi
            .string()
            .min(1)
            .max(1000)
            .required()        
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgePostUbications(body: ApiPostLibrariesLidSchemaUbicationsBody): ApiPostLibrariesLidSchemaUbicationsBody {
    return {
        ubication: body.ubication
    };
}