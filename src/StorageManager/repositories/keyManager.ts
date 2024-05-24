import { KeyStorageRepository } from './KeyStorageRepository';
import { IPrivateKey } from '../../utils/chain/types';
import { EthereumPrivateKey } from '../../utils/chain/etherum';

export abstract class KeyManager {
    protected repository: KeyStorageRepository;

    constructor(repository: KeyStorageRepository) {
        this.repository = repository;
    }

    public async addKey(name: string, privateKey: IPrivateKey): Promise<void> {
        await this.repository.storeKey(name, privateKey.getPrivateKey());
    }

    public async findByName(name: string): Promise<IPrivateKey | null> {
        const key = await this.repository.findByName(name);

        if (key && name === 'ethereum') {
            return new EthereumPrivateKey(key.value);
        }

        return null;
    }

    public async delete(name: string): Promise<void> {
        await this.repository.delete(name);
    }
}
