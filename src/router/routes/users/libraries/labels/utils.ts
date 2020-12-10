/* eslint-disable @typescript-eslint/indent */
import * as Joi from 'joi';

import { ApiPatchLabelsLidBody, ApiPostLabelsBody, ApiPutLabelsLidBody } from '@/types/api/users/libraries/labels';

export function validatePostOrPutLabels(body: any): boolean {
    const schema = Joi.object({
        name: Joi
            .string()
            .min(1)
            .max(1000)
            .required(),
        
        description: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .required(),

        color: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .required()
        
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgePostLabels(body: ApiPostLabelsBody): ApiPostLabelsBody {
    return {
        name: body.name,
        description: body.description,
        color: body.color,
        children: [],
        parent: null
    };
}

export function purgePutLabels(body: ApiPutLabelsLidBody): ApiPutLabelsLidBody {
    return {
        name: body.name,
        description: body.description,
        color: body.color
    };
}

export function validatePatchLabels(body: any): boolean {
    const schema = Joi.object({
        name: Joi
            .string()
            .min(1)
            .max(1000)
            .optional(),
        
        description: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .optional(),

        color: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .optional()
        
    })
    .required()
    .unknown();
   
    return schema.validate(body).error === undefined;
}

export function purgePatchLabels(body: ApiPatchLabelsLidBody): ApiPatchLabelsLidBody {
    return Object.keys(body)
        .filter(key => [
            'name',
            'description',
            'color'
        ].includes(key))
        .reduce<ApiPatchLabelsLidBody>((acc, curr) => ({...acc, [curr]: body[curr]}), {});
}
