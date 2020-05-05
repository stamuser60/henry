import { EntitySchema } from 'typeorm';
import { EntitySchemaColumnOptions } from 'typeorm';

export interface MPPEnrichment {
  /**
   * @format date-time
   */
  timestampMPP: String;
  /**
   * @format date-time
   */
  timestampCreated: String;
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
