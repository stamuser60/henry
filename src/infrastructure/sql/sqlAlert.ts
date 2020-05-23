import { Entity, Column, PrimaryColumn, Generated } from 'typeorm';
import { Severity } from '../../core/Alert';

@Entity('Alert')
export class SqlAlert {
  @Column('datetime', { nullable: true })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  timestampInserted: Date;

  @Column('datetime', { nullable: false })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  timestamp: Date;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  origin: string;

  @PrimaryColumn('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  ID: string;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  node: string;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  severity: Severity;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  description: string;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  object: string;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  application: string;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  operator: string;

  @Generated()
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  keyID: string;
}

export default SqlAlert;
