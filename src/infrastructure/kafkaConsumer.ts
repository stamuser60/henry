import { Message, ConsumerGroupStream, ConsumerGroupStreamOptions } from 'kafka-node';
import { CprLogger } from '@stamscope/jslogger';
import { KafkaEnrichmentDispatcher } from './kafkaDispatcher';
import { ALERT_KAFKA_CONN, ALERT_KAFKA_GROUP_ID, INFO_KAFKA_CONN, INFO_KAFKA_GROUP_ID } from '../config';

// TODO: finish writing `sendToDLQ`
// TODO: finish writing `_commitCB`
// TODO: make sure the logic on `start` works as expected.

export class KafkaEnrichmentConsumer {
  /**
   * We use `ConsumerGroupStream` here so we will be able to control more precisely the commits,
   * and reads we perform (for more info check the docs of `kafka-node` about difference between `ConsumerGroup`
   * and `ConsumerGroupStream`)
   */
  private consumer: ConsumerGroupStream;
  private dlqDispatcher: KafkaEnrichmentDispatcher;
  public name: string;
  public logger: CprLogger;
  constructor(
    name: string,
    consumer: ConsumerGroupStream,
    dlqDispatcher: KafkaEnrichmentDispatcher,
    logger: CprLogger
  ) {
    this.consumer = consumer;
    this.dlqDispatcher = dlqDispatcher;
    this.name = name;
    this.logger = logger;
  }

  /**
   * Consuming messages from the topic forwarding them to `onMessage` function.
   * A call to the function will start an event listener on the `data` event.
   * The event `data` is emitted when there is data waiting for us to consume from the topic.
   * As soon as we get the data, we `pause` the consumer, so that it wont emit any more `data` events.
   * Reason being is that we have to make sure we can process the current message, and only then move to the next one.
   * If we do not pause the consumer, it will emit more events as soon as it can and there is data,
   * resulting in multiple messages being processed at once, and much harder control over what is commit and what not.
   * As soon as the message is processed by the `onMessage` we commit the message and resume the consumer.
   *
   * @param onMessage: The function that handles the processing of the message that is received from kafka.
   *                   If the function throws an error, the message that was passed to the function will be
   *                   send to the DLQ.
   */
  start(onMessage: (message: object | object[]) => Promise<void>): void {
    this.consumer.on('data', async (msg: Message) => {
      this.consumer.pause();
      try {
        await onMessage(JSON.parse(msg.value.toString()));
        this.consumer.commit(msg, false, this._commitCB);
      } catch (e) {
        await this.sendToDLQ(msg);
      } finally {
        this.consumer.resume();
      }
    });
  }

  _commitCB(error: Error): void {
    if (error) {
      this.logger.error(`${this.name} kafka - commit cb error`);
      throw error;
    }
  }

  async sendToDLQ(msg: Message): Promise<void> {
    this.logger.error(`${this.name} kafka - disposed of ${msg} `);
    this.consumer.commit(msg, false, this._commitCB);
  }
}

const partialConsumerOptions: Partial<ConsumerGroupStreamOptions> = {
  sessionTimeout: 15000,
  protocol: ['roundrobin'],
  encoding: 'utf8',
  fromOffset: 'latest',
  outOfRangeOffset: 'earliest',
  // autoCommit is false so we can manage the commits by ourselves
  autoCommit: false
};

export const alertConsumerOptions: ConsumerGroupStreamOptions = {
  kafkaHost: ALERT_KAFKA_CONN,
  groupId: ALERT_KAFKA_GROUP_ID,
  ...partialConsumerOptions
};

export const infoConsumerOptions: ConsumerGroupStreamOptions = {
  kafkaHost: INFO_KAFKA_CONN,
  groupId: INFO_KAFKA_GROUP_ID,
  ...partialConsumerOptions
};

export function getConsumer(
  kafkaName: string,
  topicName: string,
  options: ConsumerGroupStreamOptions,
  dlqDispatcher: KafkaEnrichmentDispatcher,
  logger: CprLogger
): KafkaEnrichmentConsumer {
  const consumerGroupStream = new ConsumerGroupStream(options, topicName);
  const enrichmentConsumer = new KafkaEnrichmentConsumer(kafkaName, consumerGroupStream, dlqDispatcher, logger);

  consumerGroupStream.on('error', function(error: Error): void {
    logger.error(`${kafkaName} consumer error: ${error.stack}`);
  });
  consumerGroupStream.on('connect', function() {
    logger.debug(`connection to ${kafkaName}'s kafka is complete`);
  });
  consumerGroupStream.on('rebalancing', function() {
    logger.debug(`rebalance to ${kafkaName}'s kafka is starting`);
  });
  consumerGroupStream.on('rebalanced', function() {
    logger.debug(`rebalance to ${kafkaName}'s kafka is complete`);
  });

  return enrichmentConsumer;
}
