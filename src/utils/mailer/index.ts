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

/**
 * Sends an email
 * @param to The recipient or recipients of the email
 * @param subject The subject of the email
 * @param template The pug template of the email
 * @param ctx The context of the email
 * @param attachments The attachments of the email
 */
export async function sendEmail(to: string | string[], subject: string, template: EmailTemplates, ctx: any, attachments: any[] = []): Promise<void> {
    await mailer.sendMail({
        from: 'info@ghostmakers.it',
        to,
        subject,
        template,
        ctx,
        attachments
    } as SendMailOptions);
}