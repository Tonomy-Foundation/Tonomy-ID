import './mocks';
import { PublicKey } from '@wharfkit/antelope';
import { KeyManagerLevel } from '@tonomy/tonomy-id-sdk';
import RNKeyManager from '../../src/utils/RNKeyManager';
import { generatePrivateKeyFromPassword } from '../../src/utils/keys';

describe('RN Key Manager', () => {
    const rn = new RNKeyManager();

    it('can store a key password', async () => {
        const { privateKey, salt } = await generatePrivateKeyFromPassword('test');
        const publicKey = await rn.storeKey({
            privateKey,
            level: KeyManagerLevel.PASSWORD,
            challenge: 'test',
        });

        expect(publicKey).toBeInstanceOf(PublicKey);
    });

    // get key password
    it('can get a key password', async () => {
        const { privateKey } = await generatePrivateKeyFromPassword('test');
        const publicKey = await rn.storeKey({
            privateKey,
            level: KeyManagerLevel.PASSWORD,
            challenge: 'test',
        });
        const key = await rn.getKey({
            level: KeyManagerLevel.PASSWORD,
        });

        expect(key).toBeInstanceOf(PublicKey);
        expect(key.toString()).toEqual(publicKey.toString());
    }, 10000);
});
