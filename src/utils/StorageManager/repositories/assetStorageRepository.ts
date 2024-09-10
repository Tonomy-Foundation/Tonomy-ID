import { Repository, DataSource } from 'typeorm';
import { IAssetStorage } from '../entities/assetStorage';

export class AssetStorageRepository {
    private ormRepository: Repository<IAssetStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(IAssetStorage);
    }

    public async createAsset(assetName: string, accountName: string): Promise<IAssetStorage> {
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

    public async updateAccountBalance(key: IAssetStorage): Promise<IAssetStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { assetName: key.assetName, id: key.id } });

        if (findDoc) return await this.ormRepository.save(key);
        else throw new Error('Name not exists ');
    }

    public async findAssetByName(name: string): Promise<IAssetStorage | null> {
        return this.ormRepository.findOne({ where: { assetName: name } });
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }
}
