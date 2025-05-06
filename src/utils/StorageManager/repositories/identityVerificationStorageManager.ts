import { IdentityVerificationStorageRepository } from './identityVerificationStorageRepository';
import Debug from '../../debug';
import { util } from '@tonomy/tonomy-id-sdk';
import { IdentityVerificationStorage, VcStatus } from '../entities/identityVerificationStorage';

const { VerifiableCredential } = util;
const debug = Debug('tonomy-id:utils:storage:identityVerificationStorageManager');

type VeriffIdentityVerification = object;

export interface IdentityVerification extends IdentityVerificationStorage {
    subject: VeriffIdentityVerification;
}

export abstract class IdentityVerificationStorageManager {
    protected repository: IdentityVerificationStorageRepository;

    constructor(repository: IdentityVerificationStorageRepository) {
        this.repository = repository;
    }

    async createVc(veriffId: string, vc: typeof VerifiableCredential, status: VcStatus): Promise<void> {
        await this.repository.create(veriffId, vc.toString(), status);
    }

    async findLatestApproved(): Promise<IdentityVerification | null> {
        const doc = await this.repository.findLatestApproved();

        if (doc) {
            const vc = new VerifiableCredential<VeriffIdentityVerification>(doc.vc);
            const subject = vc.getCredentialSubject();

            return {
                ...doc,
                subject,
            };
        } else return null;
    }

    async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
