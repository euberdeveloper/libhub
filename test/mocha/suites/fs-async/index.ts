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

        it('Should create a file "prova.txt"', async function () {
            await fsAsync.writeFile(path.join(__dirname, 'assets', 'prova.txt'), 'prova');
            const exists = await fsAsync.exists(path.join(__dirname, 'assets', 'prova.txt'));
            expect(exists).to.be.true;
        });

        it('Should rename "prova.txt" with "test.txt"', async function () {
            await fsAsync.rename(path.join(__dirname, 'assets', 'prova.txt'), path.join(__dirname, 'assets', 'test.txt'));

            const removed = await fsAsync.exists(path.join(__dirname, 'assets', 'prova.txt'));
            expect(removed).to.be.false;

            const added = await fsAsync.exists(path.join(__dirname, 'assets', 'test.txt'));
            expect(added).to.be.true;
        });

        it('Should remove "test.txt"', async function () {
            await fsAsync.unlink(path.join(__dirname, 'assets', 'test.txt'));

            const removed = await fsAsync.exists(path.join(__dirname, 'assets', 'test.txt'));
            expect(removed).to.be.false;
        });

        it('Should make a directory "mydir"', async function () {
            await fsAsync.mkdir(path.join(__dirname, 'assets', 'directory'));
            const exists = await fsAsync.exists(path.join(__dirname, 'assets', 'directory'));
            expect(exists).to.be.true;
        });

        

    });

}