import { Repository, DataSource } from 'typeorm';
import { KeyStorage } from '../entities/keyStorage';

export class KeyStorageRepository {
    private ormRepository: Repository<KeyStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(KeyStorage);
    }

    public async create(name: string, value: string): Promise<KeyStorage> {
        const now = new Date();
        const keyStorageEntity = this.ormRepository.create({
            name,
            value,
            createdAt: now,
            updatedAt: now,
        });

        const storage = this.ormRepository.save(keyStorageEntity);

        return storage;
    }

    public async update(key: KeyStorage): Promise<KeyStorage> {
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
