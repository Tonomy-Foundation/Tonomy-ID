import { KeyStorageRepository } from './KeyStorageRepository';
import { IPrivateKey } from '../../chain/types';
import { EthereumPrivateKey } from '../../chain/etherum';

export abstract class KeyManager {
    protected repository: KeyStorageRepository;

    constructor(repository: KeyStorageRepository) {
        this.repository = repository;
    }

    public async emplaceKey(name: string, privateKey: IPrivateKey): Promise<void> {
        const existingKey = await this.repository.findByName(name);
        const value = await privateKey.exportPrivateKey();

        if (existingKey) {
            existingKey.value = value;
            existingKey.updatedAt = new Date();
            await this.repository.updateKey(existingKey);
        } else {
            await this.repository.storeNewKey(name, value);
        }
    }

    public async findByName(name: string): Promise<IPrivateKey | null> {
        const key = await this.repository.findByName(name);

        if (key) {
            return new EthereumPrivateKey(key.value);
        } else return null;
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
