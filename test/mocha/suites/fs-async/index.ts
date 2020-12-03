import * as path from 'path';
import { expect } from 'chai';

import * as fsAsync from '../../../../src/utils/fs-async';

export default async function () {

    describe('fs-async moduled', async function () {

        it('Should check if file "ciao.txt" exists', async function () {
            const exists = await fsAsync.exists(path.join(__dirname, 'assets', 'ciao.txt'));
            expect(exists).to.be.true;

            const notExists = await fsAsync.exists(path.join(__dirname, 'assets', 'zawarudo.txt'));
            expect(notExists).to.be.false;
        });

        

        

    });

}