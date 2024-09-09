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

        console.log('accountBalance', accountBalance);

        if (existingAccount) {
            console.log('iff');
            existingAccount.value = JSON.stringify(accountBalance);
            existingAccount.updatedAt = new Date();
            await this.repository.updateAccountBalance(existingAccount);
        } else {
            console.log('elsee');
            await this.repository.storeAccountBalance(name, JSON.stringify(accountBalance));
        }
    }

    public async findBalanceByName(name: string): Promise<Balance> {
        const balance = await this.repository.findBalanceByName(name);

        console.log('balance', balance);
        if (balance) {
            return JSON.parse(balance.value);
        } else return { balance: '0', usdBalance: 0 };
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
