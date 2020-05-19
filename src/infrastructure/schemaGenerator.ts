/**
 * Defines the json schema for each enrichment type
 */

import { resolve } from 'path';
import * as TJS from 'typescript-json-schema';
import { Definition, PartialArgs } from 'typescript-json-schema';

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

export const HermeticitySchema = TJS.generateSchema(program, 'HermeticityEnrichment', generateArgs);
export const AlertSchema = TJS.generateSchema(program, 'AlertEnrichment', generateArgs);

if (!HermeticitySchema) {
  throw Error('Could not find hermeticity schema');
}
if (!AlertSchema) {
  throw Error('Could not find alert schema');
}
modifySchema(HermeticitySchema);
modifySchema(AlertSchema);
