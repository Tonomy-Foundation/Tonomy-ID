import { Repository, DataSource } from 'typeorm/browser';
import { keyStorage } from '../entities/keyStorage';

export class KeyStorageRepository {
    private ormRepository: Repository<keyStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(keyStorage);
    }

    public async getAll(): Promise<keyStorage[]> {
        return this.ormRepository.find();
    }

    public async create(name: string, value: string): Promise<keyStorage> {
        const keyStorageEntity = this.ormRepository.create({ name, value });

        return this.ormRepository.save(keyStorageEntity);
    }

    public async findByName(name: string): Promise<keyStorage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async delete(name: string): Promise<void> {
        await this.ormRepository.delete({ name });
    }
}
