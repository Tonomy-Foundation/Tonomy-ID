import { Repository, DataSource } from 'typeorm';
import { AppStorage } from '../entities/appSettings';

export class AppStorageRepository {
    private ormRepository: Repository<AppStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(AppStorage);
    }

    public async create(name: string, value: string): Promise<AppStorage> {
        const now = new Date();
        const appStorageEntity = this.ormRepository.create({
            name,
            value,
            createdAt: now,
            updatedAt: now,
        });

        return this.ormRepository.save(appStorageEntity);
    }

    public async findByName(name: string): Promise<AppStorage | null> {
        const settings = this.ormRepository.findOne({ where: { name } });

        return settings;
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }

    public async update(settings: AppStorage): Promise<AppStorage> {
        const findDoc = await this.ormRepository.findOne({ where: { name: settings.name, id: settings.id } });

        if (findDoc) return await this.ormRepository.save(settings);
        else throw new Error('Name not exists ');
    }
}
