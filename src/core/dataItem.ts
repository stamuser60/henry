export interface Enrichment {
  /**
   * @format date-time
   */
  timestamp: string;
  /**
   * @minLength 1
   */
  origin: string;
  /**
   * @minLength 1
   */
  type: string;
}

export interface ProcessedEnrichment extends Enrichment {
  /**
   * @minLength 1
   */
  ID: string;
}

export interface Incident {
  timestampStart: Date;
  timestampUpdate: Date;
}
