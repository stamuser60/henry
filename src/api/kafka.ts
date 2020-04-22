import { addEnrichment } from '../app/addEnrichment';
import { validateEnrichmentsReceived } from './validation';
import { enrichmentConsumer, enrichmentRepo } from '../compositionRoot';
import logger from '../logger';

async function onMessage(value: object | object[]): Promise<void> {
  try {
    const valueList = Array.isArray(value) ? value : [value];
    const enrichments = validateEnrichmentsReceived(valueList);
    for (const enrichment of enrichments) {
      await addEnrichment(enrichment, enrichmentRepo);
    }
  } catch (e) {
    logger.error(`while processing message from cpr's kafka \n ${e.stack}`);
    throw e;
  }
}

function onError(error: Error): void {
  logger.error(`Error while consuming enrichments: \n ${error.stack}`);
}

export function startConsumingEnrichment(): void {
  enrichmentConsumer.start(onMessage);
  enrichmentConsumer.onError(onError);
}
