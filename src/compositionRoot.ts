import { CPR_KAFKA_TOPIC } from './config';
import { cprConsumerOptions, getConsumer } from './infrastructure/kafkaConsumer';
import logger from './logger';
import { AllEnrichmentResponse, EnrichmentRepo } from './core/repository';
import { MPPHermeticity } from './core/hermeticity';
import { MPPAlert } from './core/alert';
import { cprClientOptions, cprProducerOptions, getDispatcher } from './infrastructure/kafkaDispatcher';

const dlqDispatcher = getDispatcher('DLQ', CPR_KAFKA_TOPIC, cprClientOptions, cprProducerOptions, logger);
const enrichmentConsumer = getConsumer('CPR', CPR_KAFKA_TOPIC, cprConsumerOptions, dlqDispatcher, logger);

const enrichmentRepo: EnrichmentRepo = {
  async addHermeticity(hermeticity: MPPHermeticity): Promise<void> {
    console.log(hermeticity);
    return;
  },

  async addAlert(alert: MPPAlert): Promise<void> {
    console.log(alert);
    return;
  },

  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    return {} as AllEnrichmentResponse;
  }
};

export { enrichmentConsumer, enrichmentRepo };
