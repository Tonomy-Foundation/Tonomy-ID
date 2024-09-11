import { Asset, IAccount, IToken } from '../../chain/types';
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

        await this.repository.createAsset(name, value.getName(), token.getSymbol());
    }
    public async updateAccountBalance(token: IToken, accountBalance: Asset): Promise<void> {
        const name = token.getChain().getName() + '-' + token.getSymbol();
        const existingAsset = await this.repository.findAssetByName(name);

        if (existingAsset) {
            const balance = accountBalance.toString();
            const usdBalance = await accountBalance.getUsdValue();

            existingAsset.balance = balance;
            existingAsset.usdBalance = usdBalance;
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
