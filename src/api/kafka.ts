import { addEnrichment } from '../app/addEnrichment';
import { validateEnrichmentsReceived } from './validation';
import { alertConsumer, infoConsumer, incidentRepo } from '../compositionRoot';
import logger from '../logger';
import { preValidateAlert, PreValidateFunc, preValidateInfo } from './preValidate';
import { Enrichment } from '../core/dataItem';
import { IncidentRepo } from '../core/repository';
import { SqlRetryableError } from '../infrastructure/sql/exc';
import { SQL_INSERT_RETRY_INTERVAL_MS } from '../config';

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

async function addUntilSuccess(enrichment: Enrichment, incidentRepo: IncidentRepo): Promise<void> {
  try {
    await addEnrichment(enrichment, incidentRepo);
  } catch (e) {
    if (e instanceof SqlRetryableError) {
      await wait(SQL_INSERT_RETRY_INTERVAL_MS);
      await addUntilSuccess(enrichment, incidentRepo);
    } else {
      throw e;
    }
  }
}

export function onMessage(preValidateFunc: PreValidateFunc): (value: object | object[]) => Promise<void> {
  /**
   * Logic that is activated on each batch of data.
   * Used by the consumers of alert and info from kafka.
   */
  return async (value: object | object[]): Promise<void> => {
    try {
      const valueList = preValidateFunc(value);
      const enrichments = validateEnrichmentsReceived(valueList);
      for (const enrichment of enrichments) {
        await addUntilSuccess(enrichment, incidentRepo);
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
