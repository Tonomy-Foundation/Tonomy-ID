import { Bytes, Checksum256, KeyType, PrivateKey, PublicKey, Signature } from '@greymass/eosio';
import argon2 from 'react-native-argon2';
import * as SecureStore from 'expo-secure-store';
import settings from '../settings';
import { KeyManager, GetKeyOptions, SignDataOptions, StoreKeyOptions } from 'tonomy-id-sdk';
import { ApplicationErrors, throwError } from './errors';

const {
    KeyManagerLevel,
    randomBytes,
    randomString,
    sha256,

    decodeHex,
} = settings.sdk;

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

    async generatePrivateKeyFromPassword(
        password: string,
        salt?: Checksum256 | undefined
    ): Promise<{ privateKey: PrivateKey; salt: Checksum256 }> {
        if (!salt) salt = Checksum256.from(randomBytes(32));
        const result = await argon2(password, decodeHex(salt.hexString), {
            mode: 'argon2id',
            iterations: 3,
            memory: 16384,
            parallelism: 1,
            hashLength: 32,
        });

        const bytes = Bytes.from(result.rawHash, 'hex');
        const privateKey = new PrivateKey(KeyType.K1, bytes);
        return {
            privateKey,
            salt,
        };
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
            requireAuthentication: options.level === KeyManagerLevel.FINGERPRINT,
        });

        return keyStore.publicKey;
    }

    async signData(options: SignDataOptions): Promise<string | Signature> {
        const key = await SecureStore.getItemAsync(options.level, {
            requireAuthentication: options.level === KeyManagerLevel.FINGERPRINT,
        });
        if (!key) throw new Error('No key for this level');
        const keyStore = JSON.parse(key) as KeyStorage;

        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throw new Error('Challenge missing');
            const hashedSaltedChallenge = sha256(options.challenge + keyStore.salt);
            if (keyStore.hashedSaltedChallenge !== hashedSaltedChallenge) throw new Error('Challenge does not match');
        }

        const privateKey = keyStore.privateKey;
        let digest: Checksum256;
        if (options.data instanceof String) {
            digest = Checksum256.hash(Bytes.from(options.data));
        } else {
            digest = options.data as Checksum256;
        }

        const signature = privateKey.signDigest(digest);
        return signature;
    }

    async removeKey(options: GetKeyOptions): Promise<void> {
        await SecureStore.deleteItemAsync(options.level, {
            requireAuthentication: options.level === KeyManagerLevel.FINGERPRINT,
        });
    }

    generateRandomPrivateKey(): PrivateKey {
        return new PrivateKey(KeyType.K1, new Bytes(randomBytes(32)));
    }

    async getKey(options: GetKeyOptions): Promise<PublicKey> {
        const key = await SecureStore.getItemAsync(options.level, {
            requireAuthentication: options.level === KeyManagerLevel.FINGERPRINT,
        });
        if (!key) throwError('No key for this level', ApplicationErrors.NoKeyFound);

        const keyStore = JSON.parse(key) as KeyStorage;
        return keyStore.publicKey;
    }
}
