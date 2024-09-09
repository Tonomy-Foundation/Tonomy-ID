import { Repository, DataSource } from 'typeorm';
import { AssetStorage } from '../entities/assetStorage';

export class AssetStorageRepository {
    private ormRepository: Repository<AssetStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(AssetStorage);
    }

    public async storeAccountBalance(name: string, value: string): Promise<AssetStorage> {
        const assetStorageEntity = this.ormRepository.create({
            name,
            value,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const storage = this.ormRepository.save(assetStorageEntity);

        return storage;
    }

    public async updateAccountBalance(key: AssetStorage): Promise<AssetStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { name: key.name, id: key.id } });

        if (findDoc) return await this.ormRepository.save(key);
        else throw new Error('Name not exists ');
    }

    public async findBalanceByName(name: string): Promise<AssetStorage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }

    public async findAccountByName(name: string): Promise<AssetStorage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async updateAccountName(key: AssetStorage): Promise<AssetStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { name: key.name, id: key.id } });

        if (findDoc) return await this.ormRepository.save(key);
        else throw new Error('Name not exists ');
    }

    public async storeAccountName(name: string, value: string): Promise<AssetStorage> {
        const assetStorageEntity = this.ormRepository.create({
            name,
            value,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const storage = this.ormRepository.save(assetStorageEntity);

        return storage;
    }
}
