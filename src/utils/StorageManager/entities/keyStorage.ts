import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm/browser';

@Entity('KeyStorage')
export class KeyStorage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    value!: string;

    @Column({ type: 'datetime' })
    createdAt!: Date;

    @Column({ type: 'datetime' })
    updatedAt!: Date;
}
