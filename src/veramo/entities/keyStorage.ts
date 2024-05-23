import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm/browser';

@Entity('keyStorage')
export class keyStorage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    name!: string;

    @Column({ nullable: false })
    value!: string;
}
