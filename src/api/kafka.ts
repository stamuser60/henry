import { Message } from 'kafka-node';
import { processEnrichment } from '../app/processEnrichment';
import { validateEnrichment, validateEnrichmentType } from './validation';
import { enrichmentConsumer, enrichmentRepo } from '../compositionRoot';
import logger from '../logger';

//TODO: the two calls to `logger.error` basically log the same data, but in different way, decide which was is the best

async function onMessage(message: Message): Promise<void> {
  try {
    const messageObj = JSON.parse(message.value.toString());
    const type = validateEnrichmentType(messageObj.type);
    const enrichment = validateEnrichment(type, messageObj);
    await processEnrichment(enrichment, enrichmentRepo);
  } catch (e) {
    logger.error(`while processing message from unity's kafka: ${e.message} \n ${e.stack}`);
  }
}

function onError(error: Error): void {
  logger.error({
    message: 'Error while consuming enrichments: ' + error.message,
    stack: error.stack
  });
}

export function startConsumingAlerts(): void {
  enrichmentConsumer.start(onMessage);
  enrichmentConsumer.onError(onError);
}
