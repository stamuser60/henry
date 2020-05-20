import { ALERT_KAFKA_TOPIC, INFO_KAFKA_TOPIC } from './config';
import { alertConsumerOptions, infoConsumerOptions, getConsumer } from './infrastructure/kafkaConsumer';
import logger from './logger';
import { cprClientOptions, cprProducerOptions, getDispatcher } from './infrastructure/kafkaDispatcher';
import { incidentRepo } from './infrastructure/sql/incidentRepo';

const dlqDispatcher = getDispatcher('DLQ', ALERT_KAFKA_TOPIC, cprClientOptions, cprProducerOptions, logger);
const alertConsumer = getConsumer(`Alert's CPR`, ALERT_KAFKA_TOPIC, alertConsumerOptions, dlqDispatcher, logger);
const infoConsumer = getConsumer(`Info's CPR`, INFO_KAFKA_TOPIC, infoConsumerOptions, dlqDispatcher, logger);

export { alertConsumer, infoConsumer, incidentRepo };
