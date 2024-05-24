import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm/browser';

@Entity('storage')
export class storage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    value!: string;

    addedAt: Date;
    updatedAt: Date;
}
