import { Message, ConsumerGroupStream, Producer } from 'kafka-node';

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
  private dlqProducer: Producer;
  constructor(consumer: ConsumerGroupStream, dlqProducer: Producer) {
    this.consumer = consumer;
    this.dlqProducer = dlqProducer;
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
  start(onMessage: (message: Message) => Promise<void>): void {
    this.consumer.on('data', async (msg: Message) => {
      this.consumer.pause();
      try {
        await onMessage(msg);
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
      console.log('commit cb error');
      throw error;
    }
  }

  async sendToDLQ(msg: Message): Promise<void> {
    console.log(`disposed of ${msg} `);
    this.consumer.commit(msg, false, this._commitCB);
  }

  /**
   * Register an error handler for any errors occurring on the consumer
   * @param onError: the callback function we pass to the event handler.
   */
  onError(onError: (error: Error) => unknown): void {
    this.consumer.on('error', onError);
  }
}
