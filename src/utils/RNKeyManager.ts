import { Bytes, Checksum256, PrivateKey, PublicKey, Signature } from '@wharfkit/antelope';
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
    SdkErrors,
    CheckKeyOptions,
    STORAGE_NAMESPACE,
} from '@tonomy/tonomy-id-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

type KeyStorage = {
    privateKey: PrivateKey;
    publicKey: PublicKey;
    // TODO: check that this complies with the eosio checksum256 format
    hashedSaltedChallenge?: string;
    salt?: string;
};

export const KEY_STORAGE_NAMESPACE = STORAGE_NAMESPACE + 'key.';

export default class RNKeyManager implements KeyManager {
    async storeKey(options: StoreKeyOptions): Promise<PublicKey> {
        StoreKeyOptions.validate(options);
        const keyStore: KeyStorage = {
            privateKey: options.privateKey,
            publicKey: options.privateKey.toPublic(),
        };

        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throw new Error(`${SdkErrors.MissingChallenge}: Challenge missing`);
            keyStore.salt = randomString(32);
            keyStore.hashedSaltedChallenge = sha256(options.challenge + keyStore.salt);
        }

        // Store the private key is secure storage
        await SecureStore.setItemAsync(KEY_STORAGE_NAMESPACE + options.level, keyStore.privateKey.toString(), {
            requireAuthentication: options.level === KeyManagerLevel.BIOMETRIC,
        });

        // Store the rest of the data in async storage
        const store = keyStore as any;

        delete store.privateKey;
        await AsyncStorage.setItem(KEY_STORAGE_NAMESPACE + options.level, JSON.stringify(store));

        return keyStore.publicKey;
    }

    async signData(options: SignDataOptions): Promise<string | Signature> {
        SignDataOptions.validate(options);

        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throw new Error(`${SdkErrors.MissingChallenge}: Challenge missing`);
            const validChallenge = await this.checkKey({ level: options.level, challenge: options.challenge });

            if (!validChallenge && options.level === KeyManagerLevel.PASSWORD)
                throw new Error(`${SdkErrors.PasswordInvalid}: Invalid password`);
            if (!validChallenge && options.level === KeyManagerLevel.PIN)
                throw new Error(`${SdkErrors.PinInvalid}: Invalid PIN`);
        }

        const secureData = await SecureStore.getItemAsync(KEY_STORAGE_NAMESPACE + options.level, {
            requireAuthentication: options.level === KeyManagerLevel.BIOMETRIC,
        });

        if (!secureData) throw new Error(`${SdkErrors.KeyNotFound}: Key missing for level ${options.level}`);

        const privateKey = PrivateKey.from(secureData);

        if (options.outputType === 'jwt') {
            if (typeof options.data !== 'string') throw new Error(`${SdkErrors.InvalidData}: data must be a string`);
            const signer = createSigner(privateKey);

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

    async checkKey(options: CheckKeyOptions): Promise<boolean> {
        CheckKeyOptions.validate(options);
        const asyncStorageData = await AsyncStorage.getItem(KEY_STORAGE_NAMESPACE + options.level);

        if (!asyncStorageData) throw new Error(`${SdkErrors.KeyNotFound}: No key for this level`);

        const keyStore: KeyStorage = JSON.parse(asyncStorageData);

        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throw new Error(`${SdkErrors.MissingChallenge}: Challenge missing`);
            const hashedSaltedChallenge = sha256(options.challenge + keyStore.salt);

            return keyStore.hashedSaltedChallenge === hashedSaltedChallenge;
        } else throw new Error(`${SdkErrors.InvalidKeyLevel}: Invalid Level`);
    }

    async removeKey(options: GetKeyOptions): Promise<void> {
        GetKeyOptions.validate(options);
        await SecureStore.deleteItemAsync(KEY_STORAGE_NAMESPACE + options.level, {
            requireAuthentication: options.level === KeyManagerLevel.BIOMETRIC,
        });
    }

    async getKey(options: GetKeyOptions): Promise<PublicKey> {
        GetKeyOptions.validate(options);
        const asyncStorageData = await AsyncStorage.getItem(KEY_STORAGE_NAMESPACE + options.level);

        if (!asyncStorageData) throw new Error(`${SdkErrors.KeyNotFound}: No key for level ${options.level}`);

        const keyStore: KeyStorage = JSON.parse(asyncStorageData);

        return PublicKey.from(keyStore.publicKey);
    }
}
