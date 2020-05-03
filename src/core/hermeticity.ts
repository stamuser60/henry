import { Enrichment, MPPEnrichment, EnrichmentEntity } from './enrichment';
import { EntitySchemaColumnOptions, EntitySchema, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum HermeticityStatus {
  normal = 'normal',
  minor = 'minor',
  critical = 'critical'
}

export const hermeticityType = 'hermeticity';

export interface MPPHermeticity extends MPPEnrichment {
  /**
   * @minimum 0
   * @maximum 100
   */
  value: number;
  /**
   * @minLength 1
   */
  beakID: string;
  status: HermeticityStatus;
  /**
   * @minLength 1
   */
  hasAlert: string;
  /**
   * @minLength 1
   */
  type: typeof hermeticityType;
}

// @Entity()
// export class MPPHermeticity implements MPPHermeticity{
//   @Column("datetime")
//   timestenpCreated:Date;

//   @Column("datetime")
//   timestenpReceved:Date;

//   @Column("datetime")
//   timestampInserted:Date;

//   @Column("varchar", { length: 100 })
//   origan: string;

//   @PrimaryGeneratedColumn("int")
//   ID: string;

//   @Column("int")
//   value: number;

//   @Column("varchar", { length: 100 })
//   beakID: string;

//   @Column("varchar", { length: 100 })
//   status: HermeticityStatus;

//   @Column("varchar", { length: 100 })
//   hasAlert: string;

// }
export const MPPHermeticity1 = new EntitySchema<MPPHermeticity>({
  name: 'MPPHermeticity',
  columns: {
    ...EnrichmentEntity,
    // the CategoryEntity now has the defined id, createdAt, origan columns!
    // in addition, the following NEW fields are defined

    value: {
      type: Number
    },
    beakID: {
      type: String,
      primary: true
    },
    status: {
      type: String
    },
    hasAlert: {
      type: String
    }
  }
});

export interface Hermeticity extends Enrichment {
  value: number;
  beakID: string;
  status: HermeticityStatus;
  hasAlert: string;
}

export const Hermeticity = new EntitySchema<Hermeticity>({
  name: 'hermeticity',
  columns: {
    ...EnrichmentEntity,
    // the CategoryEntity now has the defined id, createdAt, origan columns!
    // in addition, the following NEW fields are defined

    value: {
      type: Number
    },
    beakID: {
      type: String,
      primary: true
    },
    status: {
      type: String
    },
    hasAlert: {
      type: String
    }
  }
});
