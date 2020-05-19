import { addEnrichment } from '../app/addEnrichment';
import { validateEnrichmentsReceived } from './validation';
import { alertConsumer, infoConsumer, incidentRepo } from '../compositionRoot';
import logger from '../logger';
import { preValidateAlert, PreValidateFunc, preValidateInfo } from './preValidate';

function onMessage(preValidateFunc: PreValidateFunc): (value: object | object[]) => Promise<void> {
  /**
   * Logic that is activated on each batch of data.
   * Used by the consumers of alert and info from kafka.
   */
  return async (value: object | object[]): Promise<void> => {
    try {
      const valueList = preValidateFunc(value);
      const enrichments = validateEnrichmentsReceived(valueList);
      for (const enrichment of enrichments) {
        await addEnrichment(enrichment, incidentRepo);
      }
    } catch (e) {
      logger.error(`while processing message from cpr's kafka \n ${e.stack}`);
      throw e;
    }
  };
}

export function startConsumingEnrichment(): void {
  alertConsumer.start(onMessage(preValidateAlert));
  infoConsumer.start(onMessage(preValidateInfo));
}
