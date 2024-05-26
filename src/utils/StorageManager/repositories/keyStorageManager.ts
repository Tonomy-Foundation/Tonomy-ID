import { KeyStorageRepository } from './KeyStorageRepository';
import { IPrivateKey } from '../../chain/types';
import { EthereumPrivateKey } from '../../chain/etherum';

export abstract class KeyManager {
    protected repository: KeyStorageRepository;

    constructor(repository: KeyStorageRepository) {
        this.repository = repository;
    }

    public async addKey(name: string, privateKey: IPrivateKey): Promise<void> {
        await this.repository.storeKey(name, await privateKey.toString());
    }

    public async findByName(name: string): Promise<IPrivateKey | null> {
        const key = await this.repository.findByName(name);
        let privateKey;

        if (key && key.name === 'ethereum') {
            privateKey = new EthereumPrivateKey(key.value);
        }

        if (key) {
            return privateKey;
        }

        return null;
    }

    public async delete(): Promise<void> {
        await this.repository.delete();
    }
}
