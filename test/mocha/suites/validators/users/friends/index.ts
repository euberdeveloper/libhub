import { expect } from 'chai';

import { validateFriendRequest, validateFriendRequestResponse } from '../../../../../../src/router/routes/users/friends/utils';

export default async function () {

    describe('Validators and purgers of users/friends', async function () {

        it('Should check the validateFriendRequest function accepts', async function () {
            const bodyOk = {
                message: 'tonono'
            }
            const ok = validateFriendRequest(bodyOk);
            expect(ok).to.be.true;
        });

        it('Should check the validateFriendRequest function refuses', async function () {
            const bodyWrong = null;
            const wrong = validateFriendRequest(bodyWrong);
            expect(wrong).to.be.false;
        });


    });

}