import { Repository, DataSource } from 'typeorm/browser';
import { KeyStorage } from '../entities/keyStorage';

export class KeyStorageRepository {
    private ormRepository: Repository<KeyStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(KeyStorage);
    }

    public async storeNewKey(name: string, value: string): Promise<KeyStorage> {
        const keyStorageEntity = this.ormRepository.create({
            name,
            value,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const storage = this.ormRepository.save(keyStorageEntity);

        return storage;
    }

    public async updateKey(key: KeyStorage): Promise<KeyStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { name: key.name, id: key.id } });

        if (findDoc) return await this.ormRepository.save(key);
        else throw new Error('Name not exists ');
    }

    public async findByName(name: string): Promise<KeyStorage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }
}
