/* eslint-disable indent */
import { Entity, Unique, Column, Index, PrimaryColumn } from 'typeorm';

export enum VcStatus {
    APPROVED = 'APPROVED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
}

@Entity('IdentityVerificationStorage')
@Unique(['veriffId'])
export class IdentityVerificationStorage {
    @PrimaryColumn({
        unique: true,
        type: 'varchar',
    })
    @Index()
    veriffId!: string;

    @Column({ type: 'varchar' })
    vc!: string;

    @Column({
        type: 'enum',
        enum: VcStatus,
        default: VcStatus.PENDING,
    })
    status!: string;

    @Column({ type: 'number' })
    version!: number;

    @Column({ type: 'datetime' })
    createdAt!: Date;

    @Column({ type: 'datetime' })
    updatedAt!: Date;
}
