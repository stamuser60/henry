export interface MPPEnrichment {
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
  ID: string;
  /**
   * @minLength 1
   */
  type: string;
}

export interface Enrichment {
  origin: string;
  timestampStart: Date;
  timestampUpdate: Date;
}
