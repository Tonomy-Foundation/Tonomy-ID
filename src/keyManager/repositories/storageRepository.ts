import { Repository, DataSource } from 'typeorm/browser';
import { keyStorage } from '../entities/keyStorage';
import { KeyManager } from './keyManager';
import { IPrivateKey } from '../../utils/chain/types';

export class keyStorageRepository extends KeyManager {
    protected repository: keyStorageRepository;
    private ormRepository: Repository<keyStorage>;

    constructor(dataSource: DataSource) {
        super();
        this.ormRepository = dataSource.getRepository(keyStorage);
    }

    public async getAll(): Promise<keyStorage[]> {
        return this.ormRepository.find();
    }

    public async create(name: string, value: string): Promise<keyStorage> {
        const keyStorage = this.ormRepository.create({ name, value });

        console.log('keyStorage', keyStorage);
        return this.ormRepository.save(keyStorage);
    }

    public async findByName(name: string): Promise<keyStorage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async delete(): Promise<void> {
        await this.ormRepository.clear();
    }
}
