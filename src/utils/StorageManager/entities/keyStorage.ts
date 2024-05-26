import { Entity, Unique, PrimaryGeneratedColumn, Column, Index } from 'typeorm/browser';

@Entity('KeyStorage')
@Unique(['name'])
export class KeyStorage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Index()
    name!: string;

    @Column()
    value!: string;

    @Column({ type: 'datetime' })
    createdAt!: Date;

    @Column({ type: 'datetime' })
    updatedAt!: Date;
}
