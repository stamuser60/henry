import { AlertSchema, HermeticitySchema } from '../infrastructure/schemaGenerator';
import { TypeNameEnrichment } from '../core/types';
import { Schema, Validator } from 'jsonschema';
import { hermeticityType } from '../core/hermeticity';
import { alertType } from '../core/alert';
import { Enrichment } from '../core/dataItem';
import { AppError } from '../core/exc';

export const TypeToSchema: { [key in TypeNameEnrichment]: Schema } = {
  [hermeticityType]: HermeticitySchema as Schema,
  [alertType]: AlertSchema as Schema
};

export function validateEnrichmentType(type: string): TypeNameEnrichment {
  if (!Object.keys(TypeToSchema).some(value => value === type)) {
    throw Error(`Enrichment type ${type} was not found, options are: ${Object.keys(TypeToSchema).join(', ')}`);
  }
  return type as TypeNameEnrichment;
}

const schemaValidator = new Validator();
const jsonSchemaOptions = { throwError: true };

function validateSingleEnrichment(type: TypeNameEnrichment, msg: object): Enrichment {
  const schema = TypeToSchema[type];
  try {
    schemaValidator.validate(msg, schema, jsonSchemaOptions);
  } catch (e) {
    throw new AppError(e.toString(), 422);
  }
  return msg as Enrichment;
}

type receivedMsg = object & {
  type?: string;
};

export function validateEnrichmentsReceived(values: receivedMsg[]): Enrichment[] {
  const enrichmentsReceived = [];
  for (const value of values) {
    if ('type' in value) {
      const type = validateEnrichmentType(value.type as string);
      enrichmentsReceived.push(validateSingleEnrichment(type, value));
    } else {
      throw new AppError(`message has no type in it ${value}`, 422);
    }
  }
  return enrichmentsReceived;
}
