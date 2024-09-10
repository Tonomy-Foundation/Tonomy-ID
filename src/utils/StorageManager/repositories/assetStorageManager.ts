import { IAccount, IToken } from '../../chain/types';
import { AssetStorageRepository } from './assetStorageRepository';

interface AccountStorage {
    accountName: string;
    balance: string;
    usdBalance: number;
}

export abstract class AssetStorageManager {
    protected repository: AssetStorageRepository;

    constructor(repository: AssetStorageRepository) {
        this.repository = repository;
    }
    public async createAsset(token: IToken, value: IAccount): Promise<void> {
        const name = token.getChain().getName() + '-' + token.getSymbol();

        await this.repository.createAsset(name, value.getName());
    }
    public async updateAccountBalance(
        token: IToken,
        accountBalance: {
            balance: string;
            usdBalance: number;
        }
    ): Promise<void> {
        const name = token.getChain().getName() + '-' + token.getSymbol();
        const existingAsset = await this.repository.findAssetByName(name);

        if (existingAsset) {
            existingAsset.balance = accountBalance.balance;
            existingAsset.usdBalance = accountBalance.usdBalance;
            existingAsset.updatedAt = new Date();
            await this.repository.updateAccountBalance(existingAsset);
        } else {
            throw new Error('Asset not found');
        }
    }

    public async findAssetByName(token: IToken): Promise<AccountStorage | null> {
        const name = token.getChain().getName() + '-' + token.getSymbol();
        const existingAsset = await this.repository.findAssetByName(name);

        if (existingAsset) {
            return existingAsset;
        }

        return null;
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
