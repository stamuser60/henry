import { Enrichment, Incident, ProcessedEnrichment } from './dataItem';

export enum HermeticityStatus {
  normal = 'normal',
  minor = 'minor',
  critical = 'critical'
}

export const hermeticityType = 'hermeticity';

export interface Hermeticity {
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
  hasAlert: boolean;
}

export interface HermeticityEnrichment extends Hermeticity, Enrichment {
  /**
   * @minLength 1
   */
  type: typeof hermeticityType;
}

export interface ProcessedHermeticityEnrichment extends Hermeticity, ProcessedEnrichment {}

export interface HermeticityIncident extends Hermeticity, Incident {}
