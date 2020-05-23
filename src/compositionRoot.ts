/**
 * This file holds all the initialization of complex objects that are used throughout the application.
 */

import { KAFKA_ALERT_TOPIC, KAFKA_INFO_TOPIC } from './config';
import { alertConsumerOptions, infoConsumerOptions, getConsumer } from './infrastructure/kafkaConsumer';
import logger from './logger';
import { cprClientOptions, cprProducerOptions, getDispatcher } from './infrastructure/kafkaDispatcher';
import { incidentRepo } from './infrastructure/sql/incidentRepo';

const dlqDispatcher = getDispatcher('DLQ', KAFKA_ALERT_TOPIC, cprClientOptions, cprProducerOptions, logger);
const alertConsumer = getConsumer(`Alert's CPR`, KAFKA_ALERT_TOPIC, alertConsumerOptions, dlqDispatcher, logger);
const infoConsumer = getConsumer(`Info's CPR`, KAFKA_INFO_TOPIC, infoConsumerOptions, dlqDispatcher, logger);

export { alertConsumer, infoConsumer, incidentRepo };
