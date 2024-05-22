import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm/browser';

@Entity('keyStorage')
export class keyStorage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    value!: string;
}
