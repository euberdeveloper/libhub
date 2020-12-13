import { expect } from 'chai';

import { validateSignup, validateLogin } from '../../../../../../src/router/routes/users/registration/utils';

export default async function () {

    describe('Validators and purgers of users/registrations', async function () {

        it('Should check the validateSignup function accepts', async function () {
            const bodyOk = {
                username: 'username',
                password: 'CiaoComeVa1!?',
                name: 'Eugenio',
                surname: 'Berretta',
                email: 'email@email.com'
            }
            const ok = validateSignup(bodyOk);
            expect(ok).to.be.true;
        });

    });

}