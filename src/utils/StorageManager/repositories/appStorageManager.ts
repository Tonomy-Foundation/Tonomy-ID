import { AppStorageRepository } from './appStorageRepository';
import { AppStorage } from '../entities/appStorage';

export abstract class AppStorageManager {
    protected repository: AppStorageRepository;

    constructor(repository: AppStorageRepository) {
        this.repository = repository;
    }

    async createApp(origin: string, accountName: string): Promise<void> {
        await this.repository.create(origin, accountName);
    }

    async findAppOrigin(origin: string): Promise<AppStorage | null> {
        const doc = await this.repository.findByOrigin(origin);

        if (doc) {
            return doc;
        } else return null;
    }

    public async updateAppData(
        origin: string,
        dataShared: { username: boolean; veriffDocument: boolean },
        isLoggedIn?: boolean,
        isDataShared?: boolean
    ): Promise<void> {
        const doc = await this.repository.findByOrigin(origin);

        if (doc) {
            if (isLoggedIn) doc.isLoggedIn = isLoggedIn;
            if (isDataShared) doc.isDataShared = isDataShared;

            if (dataShared) {
                doc.dataShared = {
                    ...doc.dataShared,
                    ...dataShared,
                };
            }

            await this.repository.update(doc);
        } else {
            throw new Error('Asset not found');
        }
    }

    async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
