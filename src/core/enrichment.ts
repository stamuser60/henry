export interface MPPEnrichment {
  /**
   * @format date-time
   */
  timestampMPP: string;
  /**
   * @format date-time
   */
  timestampCreated: string;
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
