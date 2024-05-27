import { AppStorageRepository } from './appSettingRepository';

export abstract class AppStorageManager {
    protected repository: AppStorageRepository;

    constructor(repository: AppStorageRepository) {
        this.repository = repository;
    }

    public async setCryptoSeed(seed: string): Promise<void> {
        const existingValue = await this.repository.findByName('seed');

        if (existingValue) {
            existingValue.value = seed;
            existingValue.updatedAt = new Date();
            await this.repository.updateSetting(existingValue);
        } else {
            await this.repository.addNewSetting('seed', seed);
        }
    }

    public async getCryptoSeed(): Promise<string | null> {
        const seed = await this.repository.findByName('seed');

        return seed ? seed.value : null;
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
