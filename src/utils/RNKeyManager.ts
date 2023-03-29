import { Bytes, Checksum256, PrivateKey, PublicKey, Signature } from '@greymass/eosio';
import * as SecureStore from 'expo-secure-store';
import {
    KeyManager,
    GetKeyOptions,
    SignDataOptions,
    StoreKeyOptions,
    KeyManagerLevel,
    randomString,
    sha256,
    createSigner,
} from '@tonomy/tonomy-id-sdk';

type KeyStorage = {
    privateKey: PrivateKey;
    publicKey: PublicKey;
    // TODO: check that this complies with the eosio checksum256 format
    hashedSaltedChallenge?: string;
    salt?: string;
};
export default class RNKeyManager implements KeyManager {
    keys: any;

    constructor() {
        this.keys = {};
    }

    // store key in object
    async storeKey(options: StoreKeyOptions): Promise<PublicKey> {
        const keyStore: KeyStorage = {
            privateKey: options.privateKey,
            publicKey: options.privateKey.toPublic(),
        };

        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throw new Error('Challenge missing');
            keyStore.salt = randomString(32);
            keyStore.hashedSaltedChallenge = sha256(options.challenge + keyStore.salt);
        }

        await SecureStore.setItemAsync(options.level, JSON.stringify(keyStore), {
            //TODO fix SDK so that no keys be stored if skipped
            // requireAuthentication: options.level === KeyManagerLevel.FINGERPRINT,
        });

        return keyStore.publicKey;
    }

    async signData(options: SignDataOptions): Promise<string | Signature> {
        const key = await SecureStore.getItemAsync(options.level, {
            //TODO fix SDK so that no keys be stored if skipped
            // requireAuthentication: options.level === KeyManagerLevel.FINGERPRINT,
        });

        if (!key) throw new Error('No key for this level');
        const keyStore = JSON.parse(key) as KeyStorage;

        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throw new Error('Challenge missing');
            const hashedSaltedChallenge = sha256(options.challenge + keyStore.salt);

            if (keyStore.hashedSaltedChallenge !== hashedSaltedChallenge) throw new Error('Challenge does not match');
        }

        const privateKey = PrivateKey.from(keyStore.privateKey);

        if (options.outputType === 'jwt') {
            if (typeof options.data !== 'string') throw new Error('data must be a string');
            const signer = createSigner(privateKey as any);

            return (await signer(options.data)) as string;
        } else {
            let digest: Checksum256;

            if (options.data instanceof String) {
                digest = Checksum256.hash(Bytes.from(options.data));
            } else {
                digest = options.data as Checksum256;
            }

            const signature = privateKey.signDigest(digest);

            return signature;
        }
    }

    async removeKey(options: GetKeyOptions): Promise<void> {
        await SecureStore.deleteItemAsync(options.level, {
            //TODO fix SDK so that no keys be stored if skipped
            // requireAuthentication: options.level === KeyManagerLevel.FINGERPRINT,
        });
    }

    async getKey(options: GetKeyOptions): Promise<PublicKey | null> {
        const key = await SecureStore.getItemAsync(options.level, {
            //TODO fix SDK so that no keys be stored if skipped
            // requireAuthentication: options.level === KeyManagerLevel.FINGERPRINT,
        });

        if (!key) return null;
        const keyStore = JSON.parse(key) as KeyStorage;

        return keyStore.publicKey;
    }
}
