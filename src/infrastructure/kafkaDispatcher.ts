import { KafkaClient, KafkaClientOptions, Producer, ProducerOptions } from 'kafka-node';
import { Incident } from '../core/dataItem';
import { ALERT_KAFKA_CONN, ALERT_KAFKA_TOPIC } from '../config';
import { CprLogger } from '@stamscope/jslogger';
import { AppError } from '../core/exc';

type promiseExecutor<T> = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;
class RetryablePromise<T> extends Promise<T> {
  static retry<T>(retries: number, executor: promiseExecutor<T>): Promise<T> {
    return new RetryablePromise(executor).catch(error =>
      retries > 0 ? RetryablePromise.retry(retries - 1, executor) : RetryablePromise.reject(error)
    );
  }
}

const SEND_RETRY_NUMBER = 2;

export class KafkaEnrichmentDispatcher {
  private producer: Producer;
  private readonly topicName: string;
  public name: string;
  public logger: CprLogger;
  constructor(name: string, producer: Producer, topicName: string, logger: CprLogger) {
    this.producer = producer;
    this.topicName = topicName;
    this.name = name;
    this.logger = logger;
  }

  async send(enrichments: Incident[]): Promise<void> {
    const name = this.name;
    return RetryablePromise.retry(SEND_RETRY_NUMBER, (resolve, reject) => {
      this.producer.send(
        [
          {
            topic: this.topicName,
            messages: JSON.stringify(enrichments)
          }
        ],
        function(err, data) {
          if (err) {
            reject(new AppError(`Error sending message to ${name} kafka: ${err.toString()}`, 503));
          }
          resolve(data);
        }
      );
    });
  }
}

export const cprClientOptions: KafkaClientOptions = {
  kafkaHost: ALERT_KAFKA_CONN as string
};

export const cprProducerOptions: ProducerOptions = {
  partitionerType: 2 // This is so that the producer will send the messages in roundrobin style
};

export function getDispatcher(
  kafkaName: string,
  topicName: string,
  clientOptions: KafkaClientOptions,
  producerOptions: ProducerOptions,
  logger: CprLogger
): KafkaEnrichmentDispatcher {
  const cprClient = new KafkaClient(cprClientOptions);
  const cprKafkaProducer = new Producer(cprClient, producerOptions);
  const enrichmentDispatcher = new KafkaEnrichmentDispatcher(kafkaName, cprKafkaProducer, ALERT_KAFKA_TOPIC, logger);
  cprKafkaProducer.on('error', function(error) {
    logger.error(`${kafkaName} producer error: ${error.stack}`);
  });
  cprKafkaProducer.on('ready', function() {
    logger.debug(`connection to ${kafkaName}'s kafka is complete`);
  });
  return enrichmentDispatcher;
}
