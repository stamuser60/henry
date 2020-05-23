import { Entity, Column, PrimaryColumn } from 'typeorm';
import { HermeticityStatus } from '../../core/hermeticity';

@Entity({ name: 'hermeticity' })
export class SqlHermeticity {
  @Column('datetime')
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  timestampinserted: Date;

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

  @Column('int')
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  value: number;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  beakID: string;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  status: HermeticityStatus;

  @Column('varchar', { length: 100 })
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  hasAlert: string;
}

export default SqlHermeticity;
