import { CPR_KAFKA_TOPIC } from './config';
//import { cprConsumerOptions, getConsumer } from './infrastructure/kafkaConsumer';
import logger from './logger';
//import { cprClientOptions, cprProducerOptions, getDispatcher } from './infrastructure/kafkaDispatcher';
import { enrichmentRepo } from './infrastructure/sql/enrichmentRepo';

//const dlqDispatcher = getDispatcher('DLQ', CPR_KAFKA_TOPIC, cprClientOptions, cprProducerOptions, logger);
//const enrichmentConsumer = getConsumer('CPR', CPR_KAFKA_TOPIC, cprConsumerOptions, dlqDispatcher, logger);

export { enrichmentRepo };
