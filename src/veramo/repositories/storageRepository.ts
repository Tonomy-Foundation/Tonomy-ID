import { Repository, DataSource } from 'typeorm/browser';
import { keyStorage } from '../entities/keyStorage';

export class keyStorageRepository {
    private ormRepository: Repository<keyStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(keyStorage);
    }

    public async getAll(): Promise<keyStorage[]> {
        return this.ormRepository.find();
    }

    public async create(name: string, value: string): Promise<keyStorage> {
        const keyStorage = this.ormRepository.create({ name, value });

        return this.ormRepository.save(keyStorage);
    }

    public async findByKeyName(name: string): Promise<keyStorage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async update(id: number, value: string): Promise<void> {
        await this.ormRepository.update(id, { value });
    }

    public async delete(id: number): Promise<void> {
        await this.ormRepository.delete(id);
    }
}
