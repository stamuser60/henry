import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { MPPHermeticity, HermeticityStatus } from '../../core/hermeticity';

@Entity()
export class Hermeticity {
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

export default Hermeticity;
