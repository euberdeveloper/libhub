import * as Joi from 'joi';

import { ApiPatchLibrariesLidBooksBidBody, ApiPostLibrariesLidBooksBody, ApiPutLibrariesLidBooksBidBody } from '@/types/api/libraries/books';

export function validatePostOrPutBooks(body: any): boolean {
    const schema = Joi.object({
        isbn: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .required(),

        title: Joi
            .string()
            .min(1)
            .max(1000)
            .required(),

        authors: Joi.array()
            .items(
                Joi
                    .string()
                    .min(1)
                    .max(1000)
            )
            .max(50),
        
        publisher: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .required(),

        publicationYear: Joi
            .date()
            .allow(null)
            .iso()
            .required(),

        edition: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .required(),

        condition: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .required(),
        
        ubication: Joi
            .string()
            .min(1)
            .max(1000)
            .required(),

        labels: Joi.array()
            .items(
                Joi
                    .string()
                    .min(1)
                    .max(1000)
            )
            .max(50),

        notes: Joi
            .string()
            .allow(null)
            .min(1)
            .max(5000)
            .required(),
        
    })
    .required()
    .unknown();

    console.log(schema.validate(body).error)
    
    return schema.validate(body).error === undefined;
}

export function purgePostBooks(body: ApiPostLibrariesLidBooksBody): ApiPostLibrariesLidBooksBody {
    return {
        isbn: body.isbn,
        title: body.title,
        authors: body.authors,
        publisher: body.publisher,
        publicationYear: body.publicationYear,
        edition: body.edition,
        condition: body.condition,
        ubication: body.ubication,
        labels: body.labels,
        pictures: [],
        notes: body.notes
    };
}

export function purgePutBooks(body: ApiPutLibrariesLidBooksBidBody): ApiPutLibrariesLidBooksBidBody {
    return {
        isbn: body.isbn,
        title: body.title,
        authors: body.authors,
        publisher: body.publisher,
        publicationYear: body.publicationYear,
        edition: body.edition,
        condition: body.condition,
        ubication: body.ubication,
        labels: body.labels,
        notes: body.notes
    };
}

export function validatePatchBooks(body: any): boolean {
    const schema = Joi.object({
        isbn: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .optional(),

        title: Joi
            .string()
            .min(1)
            .max(1000)
            .optional(),

        authors: Joi.array()
            .items(
                Joi
                    .string()
                    .min(1)
                    .max(1000)
            )
            .max(50)
            .optional(),
        
        publisher: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .optional(),

        publicationYear: Joi
            .date()
            .allow(null)
            .iso()
            .optional(),

        edition: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .optional(),

        condition: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .optional(),
        
        ubication: Joi
            .string()
            .allow(null)
            .min(1)
            .max(1000)
            .optional(),

        labels: Joi.array()
            .items(
                Joi
                    .string()
                    .min(1)
                    .max(1000)
            )
            .max(50)
            .optional(),

        notes: Joi
            .string()
            .allow(null)
            .min(1)
            .max(5000)
            .optional(),
        
    })
    .required()
    .unknown();
   
    return schema.validate(body).error === undefined;
}

export function purgePatchBooks(body: ApiPatchLibrariesLidBooksBidBody): ApiPatchLibrariesLidBooksBidBody {
    return Object.keys(body)
        .filter(key => [
            'isbn',
            'title',
            'authors',
            'publisher',
            'publicationYear',
            'edition',
            'condition',
            'ubication',
            'labels',
            'notes'
        ].includes(key))
        .reduce<ApiPatchLibrariesLidBooksBidBody>((acc, curr) => ({...acc, [curr]: body[curr]}), {});
}
