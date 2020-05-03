import { Enrichment, MPPEnrichment, EnrichmentEntity } from './enrichment';
import { EntitySchemaColumnOptions, EntitySchema } from 'typeorm';

export enum Severity {
  normal = 'normal',
  warning = 'warning',
  minor = 'minor',
  major = 'major',
  critical = 'critical'
}

export const alertType = 'alert';
export interface MPPAlert extends MPPEnrichment {
  /**
   * @minLength 1
   */
  node: string;
  severity: Severity;
  /**
   * @minLength 1
   */
  description: string;
  /**
   * @minLength 1
   */
  object: string;
  /**
   * @minLength 1
   */
  application: string;
  /**
   * @minLength 1
   */
  operator: string;
  /**
   * @minLength 1
   */
  type: typeof alertType;
}

export interface Alert extends Enrichment {
  node: string;
  severity: Severity;
  description: string;
  object: string;
  application: string;
  operator: string;
  key: string;
}

export const Alert = new EntitySchema<Alert>({
  name: 'alert',
  columns: {
    ...EnrichmentEntity,
    // the CategoryEntity now has the defined id, createdAt, origan columns!
    // in addition, the following NEW fields are defined
    severity: {
      type: String
    },
    description: {
      type: String
    },
    object: {
      type: String
    },
    application: {
      type: String
    },
    operator: {
      type: String
    },
    node: {
      type: String
    }
  }
});
