import { EntitySchema } from 'typeorm';
import { EntitySchemaColumnOptions } from 'typeorm';

export interface MPPEnrichment {
  /**
   * @format date-time
   */
  timestampMPP: Date;
  /**
   * @format date-time
   */
  timestampCreated: Date;
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

export const EnrichmentEntity = {
  timestampMPP: {
    type: Date
  } as EntitySchemaColumnOptions,
  timestampCreated: {
    type: Date
  } as EntitySchemaColumnOptions,
  timestampInserted: {
    type: Date
  } as EntitySchemaColumnOptions,
  origin: {
    type: String
  } as EntitySchemaColumnOptions,
  ID: {
    type: String,
    primary: true
  } as EntitySchemaColumnOptions
};
