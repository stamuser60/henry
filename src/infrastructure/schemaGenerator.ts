/**
 * Defines the json schema for each enrichment type
 */

import { resolve } from 'path';
import * as TJS from 'typescript-json-schema';
import { Definition, PartialArgs } from 'typescript-json-schema';

/**
 * Responsible for adding the property that states that additional properties are not allowed.
 * @param schema: the schema that is being mutated.
 */
function modifySchema(schema: Definition): void {
  schema.additionalProperties = false;
}

const program = TJS.getProgramFromFiles([
  resolve('src/core/alert.ts'),
  resolve('src/core/dataItem.ts'),
  resolve('src/core/hermeticity.ts')
]);

const generateArgs: PartialArgs = {
  required: true
};

/**
 * Acquire the schemas
 */
export const HermeticitySchema = TJS.generateSchema(program, 'HermeticityEnrichment', generateArgs);
export const AlertSchema = TJS.generateSchema(program, 'AlertEnrichment', generateArgs);

/**
 * Checking that the schemas are defined.
 */
if (!HermeticitySchema) {
  throw Error('Could not find hermeticity schema');
}
if (!AlertSchema) {
  throw Error('Could not find alert schema');
}
modifySchema(HermeticitySchema);
modifySchema(AlertSchema);
