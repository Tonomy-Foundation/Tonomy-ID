import { EthereumAccount, EthereumChain } from '../../chain/etherum';
import { IAccount } from '../../chain/types';
import { AssetStorageRepository } from './assetStorageRepository';

interface Balance {
    balance: string;
    usdBalance: number;
}

export abstract class AssetStorageManager {
    protected repository: AssetStorageRepository;

    constructor(repository: AssetStorageRepository) {
        this.repository = repository;
    }

    public async emplaceAccountBalance(chain: EthereumChain, accountBalance: Balance): Promise<void> {
        const name = chain.getNativeToken().getSymbol();
        const existingAsset = await this.repository.findAssetByName(name);

        if (existingAsset) {
            existingAsset.balance = JSON.stringify(accountBalance);
            existingAsset.updatedAt = new Date();
            await this.repository.updateAccountBalance(existingAsset);
        } else {
            await this.repository.storeAccountBalance(name, JSON.stringify(accountBalance));
        }
    }

    public async findBalanceByName(chain: EthereumChain): Promise<Balance> {
        const name = chain.getNativeToken().getSymbol();
        const existingAsset = await this.repository.findAssetByName(name);

        if (existingAsset) {
            return JSON.parse(existingAsset.balance);
        } else return { balance: '0', usdBalance: 0 };
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }

    public async emplaceAccountName(chain: EthereumChain, value: IAccount): Promise<void> {
        const name = chain.getNativeToken().getSymbol();

        console.log('namee', name);
        const existingAsset = await this.repository.findAssetByName(name);

        console.log('namee existingAsset', existingAsset);

        if (existingAsset) {
            existingAsset.accountName = value.getName();
            existingAsset.updatedAt = new Date();
            await this.repository.updateAccountName(existingAsset);
        } else {
            await this.repository.storeAccountName(name, value.getName());
        }
    }

    public async findAccountByName(chain: EthereumChain): Promise<IAccount | null> {
        const name = chain.getNativeToken().getSymbol();
        const asset = await this.repository.findAssetByName(name);

        if (asset) {
            return new EthereumAccount(chain, asset.accountName);
        } else return null;
    }
}
