import { Repository, DataSource } from 'typeorm/browser';
import { KeyStorage } from '../entities/keyStorage';
import { IPrivateKey } from '../../chain/types';

export class KeyStorageRepository {
    private ormRepository: Repository<KeyStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(KeyStorage);
    }

    public async storeKey(name: string, value: IPrivateKey): Promise<KeyStorage> {
        const keyStorageEntity = this.ormRepository.create({ name, value });

        return this.ormRepository.save(keyStorageEntity);
    }

    public async findByName(name: string): Promise<KeyStorage | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    public async delete(): Promise<void> {
        await this.ormRepository.delete({});
    }
}
