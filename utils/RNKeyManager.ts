import { Bytes, Checksum256, KeyType, PrivateKey, PublicKey, Signature } from '@greymass/eosio';
import { GetKeyOptions, KeyManager, KeyManagerLevel, randomBytes, sha256, SignDataOptions, StoreKeyOptions } from 'tonomy-id-sdk';
import * as argon2 from 'react-native-argon2';
import * as Keychain from 'react-native-keychain';
export default class RNKeyManager implements KeyManager {
  keys: any
  constructor() {
    this.keys = {}
  }
  async generatePrivateKeyFromPassword(password: string, salt?: Checksum256 | undefined): Promise<{ privateKey: PrivateKey; salt: Checksum256; }> {

    let stringSalt = salt ? salt.toString() : randomBytes(32)
    const result = await argon2(password, stringSalt);
    const privateKey = new PrivateKey(KeyType.K1, new Bytes(result.encodedHash))
    return { privateKey, salt: Checksum256.from(stringSalt) }
  }
  // store key in object
  async storeKey(options: StoreKeyOptions): Promise<PublicKey> {

    const result = await Keychain.setGenericPassword(options.level, options.privateKey.toString());
    const publicKey = options.privateKey.toPublic()
    this.keys[options.level] = options.privateKey;
    return publicKey;
  }

  signData(options: SignDataOptions): Promise<string | Signature> {
    if (!(options.level in this.keys)) throw new Error("No key for this level");

    const keyStore = this.keys[options.level];

    if (options.level === KeyManagerLevel.PASSWORD || options.level === KeyManagerLevel.PIN) {
      if (!options.challenge) throw new Error("Challenge missing");

      const hashedSaltedChallenge = sha256(options.challenge + keyStore.salt);

      if (keyStore.hashedSaltedChallenge !== hashedSaltedChallenge) throw new Error("Challenge does not match");
    }

    const privateKey = keyStore.privateKey;
    let digest: Checksum256;
    if (options.data instanceof String) {
      digest = Checksum256.hash(Buffer.from(options.data));
    } else {
      digest = options.data as Checksum256;
    }
    const signature = privateKey.signDigest(digest)

    return signature;
  }
  // remove key from object
  removeKey(options: GetKeyOptions): void {
    delete this.keys[options.level]
  }
  generateRandomPrivateKey(): PrivateKey {

    return new PrivateKey(KeyType.K1, new Bytes(randomBytes(32)))

  }
  getKey(options: GetKeyOptions): PublicKey {
    return this.keys[options.level].publicKey()
  }
}