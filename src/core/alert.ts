import { Incident, Enrichment, ProcessedEnrichment } from './dataItem';

export enum Severity {
  normal = 'normal',
  warning = 'warning',
  minor = 'minor',
  major = 'major',
  critical = 'critical'
}

export const alertType = 'alert';

export interface Alert {
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
}

export interface AlertEnrichment extends Alert, Enrichment {
  /**
   * @minLength 1
   */
  type: typeof alertType;
}

export interface ProcessedAlertEnrichment extends Alert, ProcessedEnrichment {
  type: typeof alertType;
}
// TODO: is there a way to do it without duplicating the declaration of `type`

export interface AlertIncident extends Alert, Incident {
  key: string;
}
