import { Repository, DataSource } from 'typeorm';
import { AssetsStorage } from '../entities/assetStorage';

export class AssetStorageRepository {
    private ormRepository: Repository<AssetsStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(AssetsStorage);
    }

    public async storeAccountBalance(assetName: string, balance: string): Promise<AssetsStorage> {
        const assetStorageEntity = this.ormRepository.create({
            assetName,
            balance,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const storage = this.ormRepository.save(assetStorageEntity);

        return storage;
    }

    public async updateAccountBalance(key: AssetsStorage): Promise<AssetsStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { assetName: key.assetName, id: key.id } });

        if (findDoc) return await this.ormRepository.save(key);
        else throw new Error('Name not exists ');
    }

    public async findAssetByName(name: string): Promise<AssetsStorage | null> {
        return this.ormRepository.findOne({ where: { assetName: name } });
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }

    public async updateAccountName(key: AssetsStorage): Promise<AssetsStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { assetName: key.assetName, id: key.id } });

        if (findDoc) return await this.ormRepository.save(key);
        else throw new Error('Name not exists ');
    }

    public async storeAccountName(assetName: string, accountName: string): Promise<AssetsStorage> {
        const assetStorageEntity = this.ormRepository.create({
            assetName,
            accountName,
            balance: JSON.stringify({
                balance: '0',
                usdBalance: 0,
            }),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const storage = this.ormRepository.save(assetStorageEntity);

        return storage;
    }
}
