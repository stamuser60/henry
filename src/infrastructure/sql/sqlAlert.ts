import { Entity, Column, PrimaryColumn, Generated } from 'typeorm';
import { Severity } from '../../core/Alert';

@Entity('Alert')
export class SqlAlert {
  @Column('datetime')
  timestampInserted: Date;

  @Column('datetime')
  timestampCreated: Date;

  @Column('datetime')
  timestampMPP: Date;

  @Column('varchar', { length: 100 })
  origin: string;

  @PrimaryColumn('varchar', { length: 100 })
  ID: string;

  @Column('varchar', { length: 100 })
  node: string;

  @Column('varchar', { length: 100 })
  severity: Severity;

  @Column('varchar', { length: 100 })
  description: string;

  @Column('varchar', { length: 100 })
  object: string;

  @Column('varchar', { length: 100 })
  application: string;

  @Column('varchar', { length: 100 })
  operator: string;

  @Generated()
  keyID: string;
}

export default SqlAlert;
