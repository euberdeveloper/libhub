import * as Joi from 'joi';

import { ApiPatchLabelsLidBody, ApiPostLabelsBody, ApiPutLabelsLidBody } from '@/types/api/labels';

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

        colour: Joi
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
        colour: body.colour,
        children: [],
        parent: null
    };
}

export function purgePutLabels(body: ApiPutLabelsLidBody): ApiPutLabelsLidBody {
    return {
        name: body.name,
        description: body.description,
        colour: body.colour
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

        colour: Joi
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
            'colour'
        ].includes(key))
        .reduce<ApiPatchLabelsLidBody>((acc, curr) => ({...acc, [curr]: body[curr]}), {});
}
