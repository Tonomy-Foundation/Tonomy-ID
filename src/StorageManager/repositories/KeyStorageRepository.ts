import { Repository, DataSource } from 'typeorm/browser';
import { storage } from '../entities/keyStorage';

export class KeyStorageRepository {
    private ormRepository: Repository<storage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(storage);
    }

    public async storeKey(name: string, value: string): Promise<storage> {
        const keyStorageEntity = this.ormRepository.create({ name, value });

        return this.ormRepository.save(keyStorageEntity);
    }

    public async findByName(name: string): Promise<storage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async delete(): Promise<void> {
        await this.ormRepository.delete({});
    }
}
