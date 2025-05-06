import { Repository, DataSource } from 'typeorm';
import { IdentityVerificationStorage, VcStatus } from '../entities/identityVerificationStorage';

export class IdentityVerificationStorageRepository {
    private ormRepository: Repository<IdentityVerificationStorage>;

    constructor(dataSource: DataSource) {
        this.ormRepository = dataSource.getRepository(IdentityVerificationStorage);
    }

    public async create(veriffId: string, vc: string, status: VcStatus): Promise<IdentityVerificationStorage> {
        const now = new Date();
        const appStorageEntity = this.ormRepository.create({
            veriffId,
            vc,
            status,
            version: 1,
            createdAt: now,
            updatedAt: now,
        });

        return this.ormRepository.save(appStorageEntity);
    }

    public async findByVeriffId(veriffId: string): Promise<IdentityVerificationStorage | null> {
        const identityVerification = this.ormRepository.findOne({ where: { veriffId } });

        return identityVerification;
    }

    public async findLatestApproved(): Promise<IdentityVerificationStorage | null> {
        const identityVerification = await this.ormRepository.findOne({
            where: { status: 'APPROVED' },
            order: { createdAt: 'DESC' },
        });

        return identityVerification;
    }

    public async deleteAll(): Promise<void> {
        await this.ormRepository.delete({});
    }

    public async update(identityVerification: IdentityVerificationStorage): Promise<IdentityVerificationStorage> {
        const findDoc = await this.ormRepository.findOne({
            where: { name: identityVerification.name, id: identityVerification.id },
        });

        if (findDoc) return await this.ormRepository.save(identityVerification);
        else throw new Error('Name not exists ');
    }
}
