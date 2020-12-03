import fsAsync from './suites/fs-async';
import registration from './suites/validators/users/registration';
import profile from './suites/validators/users/profile';
import friends from './suites/validators/users/friends';
import chats from './suites/validators/users/chats';
import passwordRecovery from './suites/validators/users/password-recovery';


describe('LibHub module tests', async function () {
    await fsAsync();

    describe('Validators and purgers', async function () {
        await registration();
        await profile();
        await friends();
        await chats();
        await passwordRecovery();
    })
});