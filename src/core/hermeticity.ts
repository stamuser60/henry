import { Enrichment, MPPEnrichment } from './enrichment';

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
  hasAlert: boolean;
  /**
   * @minLength 1
   */
  type: typeof hermeticityType;
}

export interface Hermeticity extends Enrichment {
  value: number;
  beakID: string;
  status: HermeticityStatus;
  hasAlert: string;
}
