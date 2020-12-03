import { createTransport, SendMailOptions } from 'nodemailer';
import { pugEngine } from 'nodemailer-pug-engine';

import { EmailTemplates } from '@/types';
import CONFIG from '@/config';

/**
 * creates a mailer transport
 */
const mailer = createTransport({
    service: CONFIG.EMAIL.SERVICE,
    auth: {
        type: CONFIG.EMAIL.TYPE,
        user: CONFIG.EMAIL.USER,
        clientId: CONFIG.EMAIL.CLIENT_ID,
        clientSecret: CONFIG.EMAIL.CLIENT_SECRET,
        refreshToken: CONFIG.EMAIL.REFRESH_TOKEN,
        accessToken: CONFIG.EMAIL.ACCESS_TOKEN,
        expires: CONFIG.EMAIL.EXPIRY_DATE
    }
} as any);
mailer.use('compile', pugEngine({
    templateDir: CONFIG.EMAIL.TEMPLATES_PATH
}));
