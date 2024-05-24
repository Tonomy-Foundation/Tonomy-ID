import { KeyStorageRepository } from './KeyStorageRepository';
import { IPrivateKey } from '../../chain/types';
import { EthereumPrivateKey } from '../../chain/etherum';

export abstract class KeyManager {
    protected repository: KeyStorageRepository;

    constructor(repository: KeyStorageRepository) {
        this.repository = repository;
    }

    public async addKey(name: string, privateKey: IPrivateKey): Promise<void> {
        await this.repository.storeKey(name, privateKey);
    }

    public async findByName(name: string): Promise<IPrivateKey | null> {
        const key = await this.repository.findByName(name);

        if (key && name === 'ethereum') {
            return new EthereumPrivateKey(key.value);
        }

        return null;
    }

    public async delete(): Promise<void> {
        await this.repository.delete();
    }
}
