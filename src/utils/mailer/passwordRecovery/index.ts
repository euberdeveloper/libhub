import { EmailTemplates } from '@/types/emails';
import { DBUser } from '@/types/database';
import CONFIG from '@/config';

import { sendEmail } from '..';

const HOSTNAME = CONFIG.EMAIL.FRONTEND_URL;

/**
 * Sends a password recovery email
 * @param user The user whom the email will be sent
 */
export async function recoverPassword(user: DBUser): Promise<void> {
    const to = user.email;
    const subject = 'LibHub - Recover password';
    const template = EmailTemplates.PASSWORD_RECOVERY_RECOVER_PASWORD;
    const ctx = {
        username: user.username,
        reoveryLink: `${HOSTNAME}/user/${user.username}/password-recovery/${user.recoverPasswordToken}`
    };

    await sendEmail(to, subject, template, ctx);
}