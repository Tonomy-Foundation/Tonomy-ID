/* eslint-disable indent */
import { Entity, Unique, Column, Index, PrimaryColumn } from 'typeorm';

@Entity('AppStorage')
@Unique(['origin'])
export class AppStorage {
    @PrimaryColumn({
        unique: true,
        type: 'varchar',
    })
    @Index()
    origin!: string;

    @Column({ type: 'varchar' })
    accountName!: string;

    @Column({ type: 'bool' })
    isLoggedIn!: boolean;

    @Column({ type: 'bool' })
    isDataShared!: boolean;

    @Column({ type: 'simple-json' })
    dataShared?: {
        username: boolean;
        veriffDocument: boolean;
    };

    @Column({ type: 'datetime' })
    createdAt!: Date;

    @Column({ type: 'datetime' })
    updatedAt!: Date;
}
