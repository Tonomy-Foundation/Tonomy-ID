/* eslint-disable indent */
import { Entity, Unique, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('AssetStorage')
@Unique(['assetName'])
export class AssetStorage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        unique: true,
        type: 'varchar',
    })
    @Column()
    @Index()
    assetName!: string;

    @Column({ type: 'varchar' })
    accountName!: string;

    @Column({ type: 'varchar' })
    balance!: string;

    @Column({ type: 'int' })
    usdBalance!: number;

    @Column({ type: 'datetime' })
    createdAt!: Date;

    @Column({ type: 'datetime' })
    updatedAt!: Date;
}
