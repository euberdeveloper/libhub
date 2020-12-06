/* eslint-disable @typescript-eslint/indent */
import * as Joi from 'joi';

import { ApiPostUserUidFriendsFriendRequestsReceivedBody, ApiPostUserUidFriendsUsernameBody } from '@/types/api/users/friends';

export function validateFriendRequest(body: any): boolean {
    const schema = Joi.object({
        mesage: Joi
            .string()
            .min(1)
            .max(1000)
            .optional()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgeFriendRequest(body: ApiPostUserUidFriendsUsernameBody): ApiPostUserUidFriendsUsernameBody {
    return {
        message: body.message
    };
}

export function validateFriendRequestResponse(body: any): boolean {
    const schema = Joi.object({
        accepted: Joi
            .boolean()
            .required(),

        mesage: Joi
            .string()
            .min(1)
            .max(1000)
            .optional()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgeFriendRequestResponse(body: ApiPostUserUidFriendsFriendRequestsReceivedBody): ApiPostUserUidFriendsFriendRequestsReceivedBody {
    return {
        accepted: body.accepted,
        message: body.message
    };
}