import { Repository, DataSource } from 'typeorm';
import { AssetStorage } from '../entities/assetStorage';

export class AssetStorageRepository {
    private ormRepository: Repository<AssetStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(AssetStorage);
    }

    public async create(assetName: string, accountName: string): Promise<AssetStorage> {
        const now = new Date();
        const assetStorageEntity = this.ormRepository.create({
            assetName,
            accountName,
            balance: '0',
            usdBalance: 0,
            createdAt: now,
            updatedAt: now,
        });

        const storage = this.ormRepository.save(assetStorageEntity);

        return storage;
    }

    public async update(key: AssetStorage): Promise<AssetStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { assetName: key.assetName, id: key.id } });

        if (findDoc) return await this.ormRepository.save(key);
        else throw new Error('Name not exists ');
    }

    public async findByAssetName(name: string): Promise<AssetStorage | null> {
        const findDoc = await this.ormRepository.findOne({ where: { assetName: name } });

        return findDoc;
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }

    public async findAll(): Promise<AssetStorage[]> {
        return await this.ormRepository.find({});
    }
}
