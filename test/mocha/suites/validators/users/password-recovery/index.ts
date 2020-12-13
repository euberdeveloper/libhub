import { expect } from 'chai';

import { validateRecovery } from '../../../../../../src/router/routes/users/password-recovery/utils';

export default async function () {

    describe('Validators and purgers of users/password-recovery', async function () {

        it('Should check the validateRecovery function accepts', async function () {
            const bodyOk = {
                password: 'Ciabatta1!?'
            }
            const ok = validateRecovery(bodyOk);
            expect(ok).to.be.true;
        });

    });

}