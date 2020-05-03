import { alertSchema, hermeticitySchema } from '../infrastructure/schemaGenerator';
import { TypeName } from '../core/types';
import { Schema, Validator } from 'jsonschema';
import { hermeticityType } from '../core/hermeticity';
import { alertType } from '../core/alert';
import { MPPEnrichment } from '../core/enrichment';
import { AppError } from '../core/exc';

export const TypeToSchema: { [key in TypeName]: Schema } = {
  [hermeticityType]: hermeticitySchema as Schema,
  [alertType]: alertSchema as Schema
};

export function validateEnrichmentType(type: string): TypeName {
  if (!Object.keys(TypeToSchema).some(value => value === type)) {
    throw Error(`Enrichment type ${type} was not found, options are: ${Object.keys(TypeToSchema).join(', ')}`);
  }
  return type as TypeName;
}

const schemaValidator = new Validator();
const jsonSchemaOptions = { throwError: true };

function validateSingleEnrichment(type: TypeName, msg: object): MPPEnrichment {
  const schema = TypeToSchema[type];
  try {
    schemaValidator.validate(msg, schema, jsonSchemaOptions);
  } catch (e) {
    throw new AppError(e.toString(), 422);
  }
  return msg as MPPEnrichment;
}

type receivedMsg = object & {
  type?: string;
};

export function validateEnrichmentsReceived(values: receivedMsg[]): MPPEnrichment[] {
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
