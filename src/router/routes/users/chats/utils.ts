/* eslint-disable @typescript-eslint/indent */
import * as Joi from 'joi';

import { ApiPostUsersUidChatsBody, ApiPostUsersUidChatsCidBody } from '@/types/api/users/chat';

export function validateCreateChat(body: any): boolean {
    const schema = Joi.object({
        recipient: Joi
            .string()
            .min(1)
            .max(1000)
            .required()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgeCreateChat(body: ApiPostUsersUidChatsBody): ApiPostUsersUidChatsBody {
    return {
        recipient: body.recipient
    };
}

export function validateCreateMessage(body: any): boolean {
    const schema = Joi.object({
        text: Joi
            .string()
            .min(1)
            .max(1000)
            .required()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgeCreateMessage(body: ApiPostUsersUidChatsCidBody): ApiPostUsersUidChatsCidBody {
    return { text: body.text };
}