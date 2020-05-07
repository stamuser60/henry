import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { HermeticityStatus } from '../../core/hermeticity';

@Entity({ name: 'hermeticity' })
export class SqlHermeticity {
  @Column('datetime')
  timestampinserted: Date;

  @Column('datetime')
  timestampCreated: Date;

  @Column('datetime')
  timestampMPP: Date;

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

export default SqlHermeticity;