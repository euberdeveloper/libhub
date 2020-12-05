/* eslint-disable @typescript-eslint/indent */
import * as Joi from 'joi';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { ApiPostUsersLoginBody, ApiPostUsersSignupBody } from '@/types/api/users/registration';

export function validateLogin(body: any): boolean {
    const schema = Joi.object({
        username: Joi
            .string()
            .min(1)
            .max(1000)
            .required(),

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

export function purgeLogin(body: ApiPostUsersLoginBody): ApiPostUsersLoginBody {
    return {
        username: body.username,
        password: body.password
    };
}

export function validateSignup(body: any): boolean {
    const schema = Joi.object({
        username: Joi
            .string()
            .min(1)
            .max(1000)
            .required(),

        password: Joi
            .string()
            .allow(null)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,23}$/)
            .required(),

        email: Joi
            .string()
            .min(1)
            .max(100)
            .email()
            .required(),

        name: Joi
            .string()
            .min(1)
            .max(100)
            .required(),

        surname: Joi
            .string()
            .min(1)
            .max(100)
            .required()
    })
    .required()
    .unknown();

    return schema.validate(body).error === undefined;
}

export function purgeSignup(body: ApiPostUsersSignupBody): ApiPostUsersSignupBody {
    function hashPassword(password: string): string {
        const salt = bcrypt.genSaltSync();
        return bcrypt.hashSync(password, salt);     
    }
    
    return {
       username: body.username,
       password: hashPassword(body.password),
       name: body.name,
       email: body.email,
       surname: body.surname,
       verificationToken: uuid(),
       verified: false,
       recoverPasswordToken: null,
       avatar: null,
       friends: []
    };
}