import { Enrichment, MPPEnrichment } from './enrichment';

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
