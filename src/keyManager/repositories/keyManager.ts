import { KeyStorageRepository } from './storageRepository';
import { IPrivateKey } from '../../utils/chain/types';

export abstract class KeyManager {
    protected abstract repository: KeyStorageRepository;

    abstract getPublicKeys(): Promise<IPrivateKey[]>;
    abstract addKey(name: string, privateKey: IPrivateKey): Promise<void>;
    abstract addSeed(name: string, privateKey: string): Promise<void>;

    abstract findByName(name: string): Promise<IPrivateKey>;
    abstract delete(name: string): Promise<void>;
}
