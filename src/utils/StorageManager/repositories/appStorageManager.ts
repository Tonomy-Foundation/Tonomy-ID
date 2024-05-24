import { AppStorageRepository } from './appSettingRepository';

export abstract class AppStorageManager {
    protected repository: AppStorageRepository;

    constructor(repository: AppStorageRepository) {
        this.repository = repository;
    }

    public async addNewSetting(name: string, value: string): Promise<void> {
        await this.repository.storeSetting(name, value);
    }

    public async findByName(name: string): Promise<string | null> {
        const key = await this.repository.findByName(name);

        if (key) return key.value;
        else return null;
    }

    public async delete(): Promise<void> {
        await this.repository.delete();
    }
}
