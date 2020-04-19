import { KafkaEnrichmentDispatcher } from './infrastructure/kafkaDispatcher';
import kafka, {
  ConsumerGroupStream,
  ConsumerGroupStreamOptions,
  KafkaClientOptions,
  ProducerOptions
} from 'kafka-node';
import { CPR_KAFKA_CONN, CPR_KAFKA_GROUP_ID, CPR_KAFKA_TOPIC } from './config';
import { KafkaEnrichmentConsumer } from './infrastructure/kafkaConsumer';
import logger from './logger';
import { AllEnrichmentResponse, EnrichmentRepo } from './core/repository';
import { MPPHermeticity } from './core/hermeticity';
import { MPPAlert } from './core/alert';

const cprClientOptions: KafkaClientOptions = {
  kafkaHost: CPR_KAFKA_CONN as string
};

const producerOptions: ProducerOptions = {
  ackTimeoutMs: 100,
  requireAcks: 1,
  partitionerType: 2 // This is so that the producer will send the messages in roundrobin style
};

const options: ConsumerGroupStreamOptions = {
  kafkaHost: CPR_KAFKA_CONN,
  groupId: CPR_KAFKA_GROUP_ID,
  sessionTimeout: 15000,
  protocol: ['roundrobin'],
  encoding: 'utf8',
  fromOffset: 'latest',
  outOfRangeOffset: 'earliest',
  fetchMaxBytes: 1024 * 1024,
  fetchMaxWaitMs: 3000,
  batch: { noAckBatchSize: 20, noAckBatchAge: 3000 },
  // autoCommit is false so we can manage the commits by ourselves
  autoCommit: false
};

const cprClient = new kafka.KafkaClient(cprClientOptions);
const cprKafkaProducer = new kafka.Producer(cprClient, producerOptions);

const unityKafkaConsumerGroup = new ConsumerGroupStream(options, CPR_KAFKA_TOPIC);

const enrichmentDispatcher = new KafkaEnrichmentDispatcher(cprKafkaProducer, CPR_KAFKA_TOPIC);
const dlqDispatcher = new KafkaEnrichmentDispatcher(cprKafkaProducer, CPR_KAFKA_TOPIC);
const enrichmentConsumer = new KafkaEnrichmentConsumer(unityKafkaConsumerGroup, cprKafkaProducer);

cprKafkaProducer.on('error', function(error) {
  logger.error(`MPP kafka producer error: ${error}`);
});
cprKafkaProducer.on('ready', function() {
  logger.debug(`connection to CPR's kafka is complete`);
});
unityKafkaConsumerGroup.on('error', function(error: Error): void {
  logger.error(`MPP kafka consumer error: ${error}`);
});
unityKafkaConsumerGroup.on('connect', function() {
  logger.debug(`connections to Unity's kafka is complete`);
});
unityKafkaConsumerGroup.on('rebalancing', function() {
  logger.debug(`rebalance to Unity's kafka is starting`);
});
unityKafkaConsumerGroup.on('rebalanced', function() {
  logger.debug(`rebalance to Unity's kafka is complete`);
});

const enrichmentRepo: EnrichmentRepo = {
  async addHermeticity(hermeticity: MPPHermeticity): Promise<void> {
    return;
  },

  async addAlert(alert: MPPAlert): Promise<void> {
    return;
  },

  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    return {} as AllEnrichmentResponse;
  }
};

export { enrichmentDispatcher, enrichmentConsumer, enrichmentRepo };
