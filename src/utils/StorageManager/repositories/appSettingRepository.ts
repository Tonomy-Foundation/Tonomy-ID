import { Repository, DataSource } from 'typeorm/browser';
import { AppStorage } from '../entities/appStorage';

export class AppStorageRepository {
    private ormRepository: Repository<AppStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(AppStorage);
    }

    public async storeSetting(name: string, value: string): Promise<AppStorage> {
        const appStorageEntity = this.ormRepository.create({
            name,
            value,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return this.ormRepository.save(appStorageEntity);
    }

    public async findByName(name: string): Promise<AppStorage | null> {
        const storage = this.ormRepository.findOne({ where: { name } });

        return storage;
    }

    public async delete(): Promise<void> {
        await this.ormRepository.delete({});
    }
}
