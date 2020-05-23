import { addEnrichment } from '../app/addEnrichment';
import { validateEnrichmentsReceived } from './validation';
import { alertConsumer, infoConsumer, incidentRepo } from '../compositionRoot';
import logger from '../logger';
import { preValidateAlert, PreValidateFunc, preValidateInfo } from './preValidate';
import { Enrichment } from '../core/dataItem';
import { IncidentRepo } from '../core/repository';
import { SqlRetryableError } from '../infrastructure/sql/exc';
import { SQL_INSERT_RETRY_INTERVAL_MS } from '../config';

/**
 * Function that pauses the execution for `ms` milliseconds for any user that uses `.then` or `await` on it.
 * Safe to use with recursion since we use `setTimeout` that prevents the call stack from overflowing.
 *
 * @param ms: time in milliseconds until the promise that is returned considered resolved.
 *
 * Usage: await wait(50) - waits 50ms and then continues
 *        await wait(0) - continues as soon as it can (as soon as event loop is empty)
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

/**
 * Will call addEnrichment until it succeeds to add it to the database or until it gets an error
 * that we cannot recover from.
 *
 * If `SqlRetryableError` is thrown, we retry.
 */
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

/**
 * Logic that is activated on each batch of data.
 * Used by the consumers of alert and info from kafka.
 */
export function onMessage(preValidateFunc: PreValidateFunc): (value: object | object[]) => Promise<void> {
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

/**
 * Kicks off the consumption of both topics, alert and info.
 */
export function startConsumingEnrichment(): void {
  alertConsumer.start(onMessage(preValidateAlert));
  infoConsumer.start(onMessage(preValidateInfo));
}
