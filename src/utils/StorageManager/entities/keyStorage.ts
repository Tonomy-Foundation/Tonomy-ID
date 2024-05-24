import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm/browser';
import { IPrivateKey } from '../../chain/types';

@Entity('KeyStorage')
export class KeyStorage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    value!: IPrivateKey;

    addedAt: Date;
    updatedAt: Date;
}
