/* eslint-disable @typescript-eslint/indent */
import * as Joi from 'joi';

import { ApiPostUsersUidLibrariesLidBooksBidReviewsBody } from '@/types/api/users/libraries/books/reviews';

export function validateCreateReview(body: any): boolean {
    const schema = Joi.object({
        title: Joi
            .string()
            .min(1)
            .max(1000)
            .required(),

        text: Joi
            .string()
            .min(1)
            .max(1000)
            .required(),

        rate: Joi
            .number()
            .min(1)
            .max(10)
            .required()

    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgeCreateReview(body: ApiPostUsersUidLibrariesLidBooksBidReviewsBody): ApiPostUsersUidLibrariesLidBooksBidReviewsBody {
    return {
        craetedOn: new Date(),
        title: body.title,
        text: body.text,
        rate: body.rate
    };
}