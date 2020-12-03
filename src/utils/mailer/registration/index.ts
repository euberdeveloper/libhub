import { EmailTemplates } from '@/types/emails';
import { DBUser } from '@/types/database';
import CONFIG from '@/config';

import { sendEmail } from '..';

const HOSTNAME = CONFIG.EMAIL.FRONTEND_URL;
/**
 * Sends an email to verify a user
 * @param user The user whom the verification email will be sent
 */
export async function verifyUser(user: DBUser): Promise<void> {
    const to = user.email;
    const subject = 'LibHub - Verify user';
    const template = EmailTemplates.REGISTRATION_VERIFY_USER;
    const ctx = {
        username: user.username,
        verificationLink: `${HOSTNAME}/users/${user._id}/verification/${user.verificationToken}`
    };

    await sendEmail(to, subject, template, ctx);
}