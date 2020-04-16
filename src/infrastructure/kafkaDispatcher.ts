import { Producer } from 'kafka-node';
import { Enrichment } from '../core/enrichment';

// TODO: implement a retry mechanism on `send`

export class KafkaEnrichmentDispatcher {
  private producer: Producer;
  private readonly topicName: string;
  constructor(producer: Producer, topicName: string) {
    this.producer = producer;
    this.topicName = topicName;
  }

  async send(enrichment: Enrichment): Promise<void> {
    return new Promise((resolve, reject) => {
      this.producer.send(
        [
          {
            topic: this.topicName,
            messages: JSON.stringify(enrichment)
          }
        ],
        function(err, data) {
          if (err) {
            reject(err);
          }
          resolve(data);
        }
      );
    });
  }
}
