import { AppStorage } from '../entities/appSettings';
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

    public async findSettingByName(name: string): Promise<AppStorage | null> {
        return this.repository.findByName(name);
    }

    public async setAppSetting(name: string, value: string): Promise<void> {
        const existingValue = await this.repository.findByName(name);
        if (existingValue) {
            existingValue.value = value;
            existingValue.updatedAt = new Date();
            await this.repository.updateSetting(existingValue);
        } else {
            console.log(name, value);
            await this.repository.addNewSetting(name, value);
        }
    }
}
