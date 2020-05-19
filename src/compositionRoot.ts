import { ALERT_KAFKA_TOPIC, INFO_KAFKA_TOPIC } from './config';
import { alertConsumerOptions, infoConsumerOptions, getConsumer } from './infrastructure/kafkaConsumer';
import logger from './logger';
import { AllEnrichmentResponse, IncidentRepo } from './core/repository';
import { ProcessedHermeticityEnrichment } from './core/hermeticity';
import { ProcessedAlertEnrichment } from './core/alert';
import { cprClientOptions, cprProducerOptions, getDispatcher } from './infrastructure/kafkaDispatcher';

const dlqDispatcher = getDispatcher('DLQ', ALERT_KAFKA_TOPIC, cprClientOptions, cprProducerOptions, logger);
const alertConsumer = getConsumer(`Alert's CPR`, ALERT_KAFKA_TOPIC, alertConsumerOptions, dlqDispatcher, logger);
const infoConsumer = getConsumer(`Info's CPR`, INFO_KAFKA_TOPIC, infoConsumerOptions, dlqDispatcher, logger);

const incidentRepo: IncidentRepo = {
  async addHermeticity(hermeticity: ProcessedHermeticityEnrichment): Promise<void> {
    console.log(hermeticity);
    return;
  },

  async addAlert(alert: ProcessedAlertEnrichment): Promise<void> {
    console.log(alert);
    return;
  },

  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    return {} as AllEnrichmentResponse;
  }
};

export { alertConsumer, infoConsumer, incidentRepo };
