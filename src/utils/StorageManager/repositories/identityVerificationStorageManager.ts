import { IdentityVerificationStorageRepository } from './identityVerificationStorageRepository';
import { VcStatus } from '../entities/identityVerificationStorage';
import { VerifiableCredential } from '@tonomy/tonomy-id-sdk/build/sdk/types/sdk/util/ssi/vc';

// from https://devdocs.veriff.com/docs/decision-webhook#sample-request
type VeriffIdentityVerification = {
    status: string;
    verification: {
        id: string;
        attemptId: string;
        vendorData: string | null;
        endUserId: string | null;
        status: string;
        code: number;
        reason: string | null;
        reasonCode: number | null;
        decisionTime: string;
        acceptanceTime: string;
        person: {
            firstName: string;
            lastName: string;
            dateOfBirth: string;
            gender: string | null;
            nationality: string | null;
            idNumber: string | null;
            yearOfBirth: string;
            placeOfBirth: string;
            addresses: {
                fullAddress: string;
                parsedAddress: {
                    city: string | null;
                    unit: string | null;
                    state: string;
                    street: string;
                    country: string;
                    postcode: string;
                    houseNumber: string | null;
                };
            }[];
            fullName: string;
            occupation: string;
            employer: string;
            foreignerStatus: string;
            extraNames: string;
            title: string;
            pepSanctionMatch: string | null;
            citizenship: string | null;
        };
        document: {
            number: string;
            validFrom: string | null;
            validUntil: string;
            type: string;
            country: string;
            state: string;
            placeOfIssue: string;
            firstIssue: string;
            issueNumber: string;
            issuedBy: string;
            remarks: string;
            nfcValidated: boolean;
            residencePermitType: string;
            portraitIsVisible: string;
            signatureIsVisible: string;
            specimen: {
                containsContactlessChip: boolean;
                firstIssuedDate: string;
                lastIssuedDate: string;
                nistVersion: string;
                digitalDocument: boolean;
                nonStandardDrivingLicense: boolean;
                militaryDocument: boolean;
                temporaryEmergencyDocument: boolean;
                asylumRefugeeDocument: boolean;
                ICAOStandardizedDocument: boolean;
                notNationalIdCard: boolean;
                legalStatus: string;
                hasSecurityRisk: boolean;
            };
        };
        additionalVerifiedData?: {
            driversLicenseNumber: string;
            driversLicenseCategory: Record<string, boolean>;
            driversLicenseCategoryFrom: Record<string, string>;
            driversLicenseCategoryUntil: Record<string, string>;
            driversLicenseCategories: string[];
            estimatedAge: number;
            estimatedGender: number;
            processNumber: string;
            cpfValidation?: {
                status: string;
                cpfNumber: string;
                name: string;
                dateOfBirth: string;
                yearOfDeath: string | null;
            };
            ineBiometricRegistryValidation?: {
                faceMatch: boolean;
                faceMatchPercentage: number;
                responseStatus: string;
            };
            registryValidation?: {
                countryRegistry: string;
                registryName: string;
                fullNameSimilarity: number;
                documentValid: boolean;
                personIsAlive: boolean;
            };
            proofOfAddress?: {
                nameMatch: boolean;
                nameMatchPercentage: number;
                documentType: string;
            };
            validationResults?: {
                registryName: string;
                firstName: string;
                lastName: string;
                dateOfBirth: string;
                address: string;
                city: string;
                state: string;
                zip: string;
                idNumber: string;
            }[];
        };
        riskScore?: {
            score: number;
        };
        riskLabels?: {
            label: string;
            category: string;
            sessionIds: string[];
        }[];
        biometricAuthentication?: {
            matchedSessionId: string;
            matchedSessionEndUserId: string;
            matchedSessionVendorData: string;
            details: Record<string, unknown>;
        };
        comments: any[];
    } | null;
    highRisk: boolean;
    technicalData: {
        ip: string | null;
    };
};

export abstract class IdentityVerificationStorageManager {
    protected repository: IdentityVerificationStorageRepository;

    constructor(repository: IdentityVerificationStorageRepository) {
        this.repository = repository;
    }

    async createVc(
        veriffId: string,
        vc: VerifiableCredential<VeriffIdentityVerification>,
        status: VcStatus
    ): Promise<void> {
        await this.repository.create(veriffId, vc.toString(), status);
    }

    async findLatestApproved(): Promise<VerifiableCredential<VeriffIdentityVerification> | null> {
        const doc = await this.repository.findLatestApproved();

        if (doc) {
            return new VerifiableCredential<VeriffIdentityVerification>(doc.vc);
        } else return null;
    }

    async deleteAll(): Promise<void> {
        await this.repository.deleteAll();
    }
}
