import { Entity, Column, PrimaryColumn } from 'typeorm';
import { HermeticityStatus } from '../../core/hermeticity';

@Entity({ name: 'hermeticity' })
export class SqlHermeticity {
  @Column('datetime')
  timestampInserted: Date;

  @Column('datetime')
  timestamp: Date;

  @Column('varchar', { length: 100 })
  origin: string;

  @PrimaryColumn('varchar', { length: 100 })
  ID: string;

  @Column('int')
  value: number;

  @Column('varchar', { length: 100 })
  beakID: string;

  @Column('varchar', { length: 100 })
  status: HermeticityStatus;

  @Column('varchar', { length: 100 })
  hasAlert: string;
}
