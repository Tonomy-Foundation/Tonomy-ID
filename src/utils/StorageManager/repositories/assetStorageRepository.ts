import { Repository, DataSource } from 'typeorm';
import { AssetStorage } from '../entities/assetStorage';

export class AssetStorageRepository {
    private ormRepository: Repository<AssetStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(AssetStorage);
    }

    public async createAsset(assetName: string, accountName: string): Promise<AssetStorage> {
        const assetStorageEntity = this.ormRepository.create({
            assetName,
            accountName,
            balance: '0',
            usdBalance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const storage = this.ormRepository.save(assetStorageEntity);

        return storage;
    }

    public async updateAccountBalance(key: AssetStorage): Promise<AssetStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { assetName: key.assetName, id: key.id } });

        if (findDoc) return await this.ormRepository.save(key);
        else throw new Error('Name not exists ');
    }

    public async findAssetByName(name: string): Promise<AssetStorage | null> {
        const findDoc = await this.ormRepository.findOne({ where: { assetName: name } });

        return findDoc;
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }

    public async findAll(): Promise<void> {
        console.log('findAll', await this.ormRepository.find({}));
    }
}
