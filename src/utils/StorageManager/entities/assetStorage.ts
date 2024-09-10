/* eslint-disable indent */
import { Entity, Unique, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('AssetsStorage')
@Unique(['assetName'])
export class AssetsStorage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        unique: true,
        type: 'varchar',
    })
    @Index()
    assetName!: string;

    @Column({ type: 'varchar' })
    accountName!: string;

    @Column({ type: 'varchar' })
    balance!: string;

    @Column({ type: 'datetime' })
    createdAt!: Date;

    @Column({ type: 'datetime' })
    updatedAt!: Date;
}
