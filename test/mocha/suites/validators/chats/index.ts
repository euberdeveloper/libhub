import { expect } from 'chai';

import { validateCreateChat, validateCreateMessage } from '../../../../../../src/router/routes/users/chats/utils';

export default async function () {

    describe('Validators and purgers of users/chats', async function () {

        it('Should check the validateCreateChat function accepts', async function () {
            const bodyOk = {
                recipient: '_id'
            }
            const ok = validateCreateChat(bodyOk);
            expect(ok).to.be.true;
        });

        it('Should check the validateCreateChat function refuses', async function () {
            const bodyWrong = {
                recipient: null
            }
            const wrong = validateCreateChat(bodyWrong);
            expect(wrong).to.be.false;
        });

    });

}