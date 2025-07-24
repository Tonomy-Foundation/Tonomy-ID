import { AppStorageRepository } from './appSettingsStorageRepository';

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
            await this.repository.update(existingValue);
        } else {
            await this.repository.create('seed', seed);
        }
    }

    public async getCryptoSeed(): Promise<string | null> {
        const seed = await this.repository.findByName('seed');

        return seed ? seed.value : null;
    }

    public async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }

    //-- Setting >> Developer Mode
    public async setDeveloperMode(mode: boolean): Promise<void> {
        const existingValue = await this.repository.findByName('developerMode');

        if (existingValue) {
            existingValue.value = mode.toString();
            existingValue.updatedAt = new Date();
            await this.repository.update(existingValue);
        } else {
            await this.repository.create('developerMode', mode.toString());
        }
    }
    public async getDeveloperMode(): Promise<boolean> {
        const mode = await this.repository.findByName('developerMode');

        return mode?.value === 'true' ? true : false;
    }

    //-- Splace Screen >> Onboarding
    public async setSplashOnboarding(value: boolean): Promise<void> {
        const existingValue = await this.repository.findByName('splashOnboarding');

        if (existingValue) {
            existingValue.value = value.toString();
            existingValue.updatedAt = new Date();
            await this.repository.update(existingValue);
        } else {
            await this.repository.create('splashOnboarding', value.toString());
        }
    }
    public async getSplashOnboarding(): Promise<boolean> {
        const onboarding = await this.repository.findByName('splashOnboarding');

        return onboarding?.value === 'false' ? false : true;
    }

    //-- Home >> App Instructions
    public async setAppInstruction(value: boolean): Promise<void> {
        const existingValue = await this.repository.findByName('appInstruction');

        if (existingValue) {
            existingValue.value = value.toString();
            existingValue.updatedAt = new Date();
            await this.repository.update(existingValue);
        } else {
            await this.repository.create('appInstruction', value.toString());
        }
    }
    public async getAppInstruction(): Promise<boolean> {
        const instructions = await this.repository.findByName('appInstruction');

        return instructions?.value === 'false' ? false : true;
    }
}
