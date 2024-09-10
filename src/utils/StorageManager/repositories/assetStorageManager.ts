import { EthereumChain } from '../../chain/etherum';
import { IAccount } from '../../chain/types';
import { AssetStorageRepository } from './assetStorageRepository';

interface Balance {
    balance: string;
    usdBalance: number;
}

interface AccountStorage {
    accountName: string;
    balance: Balance;
}

export abstract class AssetStorageManager {
    protected repository: AssetStorageRepository;

    constructor(repository: AssetStorageRepository) {
        this.repository = repository;
    }
    public async createAsset(chain: EthereumChain, value: IAccount): Promise<void> {
        const name = chain.getNativeToken().getSymbol();

        await this.repository.createAsset(name, value.getName());
    }
    public async updateAccountBalance(chain: EthereumChain, accountBalance: Balance): Promise<void> {
        const name = chain.getNativeToken().getSymbol();
        const existingAsset = await this.repository.findAssetByName(name);

        if (existingAsset) {
            existingAsset.balance = JSON.stringify(accountBalance);
            existingAsset.updatedAt = new Date();
            await this.repository.updateAccountBalance(existingAsset);
        } else {
            throw new Error('Asset not found');
        }
    }

    public async findAssetByName(chain: EthereumChain): Promise<AccountStorage | null> {
        const name = chain.getNativeToken().getSymbol();
        const existingAsset = await this.repository.findAssetByName(name);

        if (existingAsset) {
            return { accountName: existingAsset.accountName, balance: JSON.parse(existingAsset.balance) };
        }

        return null;
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
