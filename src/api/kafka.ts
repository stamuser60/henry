import { Message } from 'kafka-node';
import { addEnrichment } from '../app/addEnrichment';
import { validateEnrichment, validateEnrichmentType } from './validation';
import { enrichmentConsumer, enrichmentRepo } from '../compositionRoot';
import logger from '../logger';

async function onMessage(message: Message): Promise<void> {
  try {
    const messageObj = JSON.parse(message.value.toString());
    const type = validateEnrichmentType(messageObj.type);
    const enrichment = validateEnrichment(type, messageObj);
    await addEnrichment(enrichment, enrichmentRepo);
  } catch (e) {
    logger.error(`while processing message from cpr's kafka \n ${e.stack}`);
  }
}

function onError(error: Error): void {
  logger.error(`Error while consuming enrichments: \n ${error.stack}`);
}

export function startConsumingEnrichment(): void {
  enrichmentConsumer.start(onMessage);
  enrichmentConsumer.onError(onError);
}
