import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm/browser';

@Entity('AppStorage')
export class AppStorage {
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
