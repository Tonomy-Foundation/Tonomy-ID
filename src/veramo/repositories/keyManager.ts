import { keyStorageRepository } from './storageRepository';
import { keyStorage } from '../entities/keyStorage';

export abstract class KeyManager {
    protected abstract repository: keyStorageRepository;

    abstract getAll(): Promise<keyStorage[]>;
    abstract create(name: string, value: string): Promise<keyStorage>;
    abstract findByName(name: string): Promise<keyStorage | null>;
    abstract delete(id: number): Promise<void>;
}
