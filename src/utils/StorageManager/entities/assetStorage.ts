/* eslint-disable indent */
import { Entity, Unique, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('AssetStorage')
@Unique(['name'])
export class AssetStorage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        unique: true,
        type: 'varchar',
    })
    @Index()
    name!: string;

    @Column({ type: 'varchar' })
    value!: string;

    @Column({ type: 'datetime' })
    createdAt!: Date;

    @Column({ type: 'datetime' })
    updatedAt!: Date;
}
