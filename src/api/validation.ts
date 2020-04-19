import { alertSchema, hermeticitySchema } from '../infrastructure/schemaGenerator';
import { Definition } from 'typescript-json-schema';
import { TypeName } from '../core/types';
import { Schema, Validator } from 'jsonschema';
import { hermeticityType } from '../core/hermeticity';
import { alertType } from '../core/alert';
import { MPPEnrichment } from '../core/enrichment';
import { AppError } from '../core/exc';

export const TypeToValidation: { [key in TypeName]: Definition } = {
  [hermeticityType]: hermeticitySchema as Definition,
  [alertType]: alertSchema as Definition
};

export function validateEnrichmentType(type: string): TypeName {
  if (!Object.keys(TypeToValidation).some(value => value === type)) {
    throw Error(`Enrichment type ${type} was not found, options are: ${Object.keys(TypeToValidation).join(', ')}`);
  }
  return type as TypeName;
}

export function validateEnrichment(type: TypeName, msg: object): MPPEnrichment {
  const newNodeValidator = new Validator();
  const jsonSchemaOptions = { throwError: true };
  const schema = TypeToValidation[type];
  try {
    newNodeValidator.validate(msg, schema as Schema, jsonSchemaOptions);
  } catch (e) {
    throw new AppError(e.toString(), 422);
  }
  return msg as MPPEnrichment;
}
