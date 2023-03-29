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
    throwError,
    SdkErrors,
    KeyStorage,
    CheckKeyOptions,
} from '@tonomy/tonomy-id-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

type KeyStorage = {
    privateKey: PrivateKey;
    publicKey: PublicKey;
    // TODO: check that this complies with the eosio checksum256 format
    hashedSaltedChallenge?: string;
    salt?: string;
};
export default class RNKeyManager implements KeyManager {
    async storeKey(options: StoreKeyOptions): Promise<PublicKey> {
        const keyStore: KeyStorage = {
            privateKey: options.privateKey,
            publicKey: options.privateKey.toPublic(),
        };

        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throwError('Challenge missing', SdkErrors.MissingChallenge);
            keyStore.salt = randomString(32);
            keyStore.hashedSaltedChallenge = sha256(options.challenge + keyStore.salt);
        }

        // Store the private key is secure storage
        await SecureStore.setItemAsync('tonomy.id.key.' + options.level, keyStore.privateKey.toString(), {
            requireAuthentication: options.level === KeyManagerLevel.BIOMETRIC,
        });

        // Store the rest of the data in async storage
        const store = keyStore.privateKey as any;

        delete store.privateKey;
        await AsyncStorage.setItem('tonomy.id.key.' + options.level, JSON.stringify(store));

        return keyStore.publicKey;
    }

    async signData(options: SignDataOptions): Promise<string | Signature> {
        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throwError('Challenge missing', SdkErrors.MissingChallenge);
            await this.checkKey({ level: options.level, challenge: options.challenge });
        }

        const secureData = await SecureStore.getItemAsync(options.level, {
            requireAuthentication: options.level === KeyManagerLevel.BIOMETRIC,
        });

        const privateKey = PrivateKey.from(secureData);

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

    async checkKey(options: CheckKeyOptions): Promise<boolean> {
        const asyncStorageData = await AsyncStorage.getItem('tonomy.id.key.' + options.level);

        if (!asyncStorageData) throwError('No key for this level', SdkErrors.KeyNotFound);

        const keyStore: KeyStorage = JSON.parse(asyncStorageData);

        if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
            if (!options.challenge) throw new Error('Challenge missing');
            const hashedSaltedChallenge = sha256(options.challenge + keyStore.salt);

            return keyStore.hashedSaltedChallenge !== hashedSaltedChallenge;
        } else throw throwError('Invalid Level', SdkErrors.InvalidKeyLevel);
    }

    async removeKey(options: GetKeyOptions): Promise<void> {
        await SecureStore.deleteItemAsync(options.level, {
            requireAuthentication: options.level === KeyManagerLevel.BIOMETRIC,
        });
    }

    async getKey(options: GetKeyOptions): Promise<PublicKey | null> {
        const asyncStorageData = await AsyncStorage.getItem('tonomy.id.key.' + options.level);

        if (!asyncStorageData) throwError('No key for this level', SdkErrors.KeyNotFound);

        const keyStore: KeyStorage = JSON.parse(asyncStorageData);

        return keyStore.publicKey;
    }
}
