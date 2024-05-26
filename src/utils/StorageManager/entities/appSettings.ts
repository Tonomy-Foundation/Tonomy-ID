import { Entity, Unique, PrimaryGeneratedColumn, Column, Index } from 'typeorm/browser';

@Entity('AppStorage')
@Unique(['name'])
export class AppStorage {
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
