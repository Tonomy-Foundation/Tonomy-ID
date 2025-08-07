import { KeyStorageRepository } from './KeyStorageRepository';
import { ChainType, IChain, IPrivateKey } from '../../chain/types';
import { EthereumChain, EthereumPrivateKey } from '../../chain/etherum';
import { AntelopeChain, AntelopePrivateKey } from '../../chain/antelope';

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
            await this.repository.update(existingKey);
        } else {
            await this.repository.create(name, value);
        }
    }

    public async findByName(name: string, chain: IChain): Promise<IPrivateKey | null> {
        const key = await this.repository.findByName(name);

        if (key) {
            if (chain.getChainType() === ChainType.ETHEREUM) {
                return new EthereumPrivateKey(key.value, chain as EthereumChain);
            } else {
                return AntelopePrivateKey.fromPrivateKeyHex(key.value, chain as AntelopeChain);
            }
        } else return null;
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
