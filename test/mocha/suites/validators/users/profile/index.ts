import { expect } from 'chai';

import {  validatePatchProfile, validatePutProfile, validatePutProfilePassword} from '../../../../../../src/router/routes/users/profile/utils';

export default async function () {

    describe('Validators and purgers of users/profile', async function () {

        it('Should check the validatePatchProfile function accepts', async function () {
            const bodyOk = {
                name: 'Bonn'
            }
            const ok = validatePatchProfile(bodyOk);
            expect(ok).to.be.true;
        });

        it('Should check the validatePatchProfile function refuses', async function () {
            const bodyWrong = {
                name: 23
            }
            const wrong = validatePatchProfile(bodyWrong);
            expect(wrong).to.be.false;
        });

        it('Should check the validatePutProfile function accepts', async function () {
            const bodyOk = {
                name: 'Federico',
                surname: 'Stefini'
            }
            const ok = validatePutProfile(bodyOk);
            expect(ok).to.be.true;
        });


    });

}