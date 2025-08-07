import { IAccount, IAsset, IToken } from '../../chain/types';
import { AssetStorageRepository } from './assetStorageRepository';
import Debug from '../../debug';

const debug = Debug('tonomy-id:utils:storage:assetStorageManager');

export interface AssetStorage {
    accountName: string;
    balance: string;
    usdBalance: number;
    assetName?: string;
}

export abstract class AssetStorageManager {
    protected repository: AssetStorageRepository;

    constructor(repository: AssetStorageRepository) {
        this.repository = repository;
    }
    public async createAsset(asset: IAsset, value: IAccount): Promise<void> {
        const token = asset.getToken();
        const symbol = token.getSymbol();
        const name = token.getChain().getName() + '-' + symbol;

        await this.repository.create(name, value.getName());
    }
    public async updateAccountBalance(asset: IAsset): Promise<void> {
        const name = asset.getToken().getChain().getName() + '-' + asset.getToken().getSymbol();
        const existingAsset = await this.repository.findByAssetName(name);

        if (existingAsset) {
            const balance = asset.toString();

            debug(`updateAccountBalance() updating ${name} balance to ${balance}`);

            try {
                const usdBalance = await asset.getUsdValue();

                if (usdBalance >= 0 && usdBalance !== existingAsset.usdBalance) {
                    existingAsset.usdBalance = usdBalance;
                }
            } catch (error) {
                debug(`updateAccountBalance() error fetching ${name} usd balance`, error);
            }

            existingAsset.balance = balance.split(' ')[0];
            existingAsset.updatedAt = new Date();
            await this.repository.update(existingAsset);
        } else {
            throw new Error('Asset not found');
        }
    }

    public async findAssetByName(token: IToken): Promise<AssetStorage | null> {
        const name = token.getChain().getName() + '-' + token.getSymbol();

        const existingAsset = await this.repository.findByAssetName(name);

        if (existingAsset) {
            return existingAsset;
        }

        return null;
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
