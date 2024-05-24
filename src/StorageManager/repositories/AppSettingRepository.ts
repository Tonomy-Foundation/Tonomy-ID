import { Repository, DataSource } from 'typeorm/browser';
import { storage } from '../entities/storage';

export class AppStorageRepository {
    private ormRepository: Repository<storage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(storage);
    }

    public async storeSetting(name: string, value: string): Promise<storage> {
        const appStorageEntity = this.ormRepository.create({ name, value });

        return this.ormRepository.save(appStorageEntity);
    }

    public async findByName(name: string): Promise<storage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async delete(name: string): Promise<void> {
        await this.ormRepository.delete({ name });
    }
}
