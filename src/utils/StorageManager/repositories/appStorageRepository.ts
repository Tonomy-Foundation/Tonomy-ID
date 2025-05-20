import { Repository, DataSource } from 'typeorm';
import { AppStorage } from '../entities/appStorage';

export class AppStorageRepository {
    private ormRepository: Repository<AppStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(AppStorage);
    }

    public async create(origin: string, accountName: string): Promise<AppStorage> {
        const now = new Date();
        const appStorageEntity = this.ormRepository.create({
            origin,
            accountName,
            dataShared: {
                username: false,
                veriffDocument: false,
            },
            isDataShared: false,
            isLoggedIn: false,
            createdAt: now,
            updatedAt: now,
        });

        return this.ormRepository.save(appStorageEntity);
    }

    public async findByOrigin(origin: string): Promise<AppStorage | null> {
        const doc = this.ormRepository.findOne({ where: { origin } });

        return doc;
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }

    public async update(appDetail: AppStorage): Promise<AppStorage> {
        const doc = await this.ormRepository.findOne({
            where: { origin: appDetail.origin },
        });

        if (doc) return await this.ormRepository.save(appDetail);
        else throw new Error('App origin not exists ');
    }
}
