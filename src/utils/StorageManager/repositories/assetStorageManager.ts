import {
    EthereumAccount,
    EthereumChain,
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumSepoliaChain,
} from '../../chain/etherum';
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

    public async emplaceAccountBalance(name: string, accountBalance: Balance): Promise<void> {
        const existingAccount = await this.repository.findBalanceByName(name);

        if (existingAccount) {
            existingAccount.value = JSON.stringify(accountBalance);
            existingAccount.updatedAt = new Date();
            await this.repository.updateAccountBalance(existingAccount);
        } else {
            await this.repository.storeAccountBalance(name, JSON.stringify(accountBalance));
        }
    }

    public async findBalanceByName(name: string): Promise<Balance> {
        const balance = await this.repository.findBalanceByName(name);

        if (balance) {
            return JSON.parse(balance.value);
        } else return { balance: '0', usdBalance: 0 };
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }

    public async emplaceAccountName(name: string, value: IAccount): Promise<void> {
        const existingAccount = await this.repository.findAccountByName(name);

        if (existingAccount) {
            existingAccount.value = value.getName();
            existingAccount.updatedAt = new Date();
            await this.repository.updateAccountName(existingAccount);
        } else {
            await this.repository.storeAccountName(name, value.getName());
        }
    }

    public async findAccountByName(name: string): Promise<IAccount | null> {
        const account = await this.repository.findAccountByName(name);
        let chain;

        if (name === 'ethereum account') chain = EthereumMainnetChain;
        else if (name === 'ethereumTestnetSepolia account') chain = EthereumSepoliaChain;
        else if (name === 'ethereumPolygon account') chain = EthereumPolygonChain;

        if (account) {
            return new EthereumAccount(chain, account.value);
        } else return null;
    }
}
