import { CPR_KAFKA_TOPIC } from './config';
import { cprConsumerOptions, getConsumer } from './infrastructure/kafkaConsumer';
import logger from './logger';
import { AllEnrichmentResponse, EnrichmentRepo } from './core/repository';
import { MPPHermeticity } from './core/hermeticity';
import { MPPAlert } from './core/alert';
import { cprClientOptions, cprProducerOptions, getDispatcher } from './infrastructure/kafkaDispatcher';
import { createConnection } from 'typeorm';

const dlqDispatcher = getDispatcher('DLQ', CPR_KAFKA_TOPIC, cprClientOptions, cprProducerOptions, logger);
const enrichmentConsumer = getConsumer('CPR', CPR_KAFKA_TOPIC, cprConsumerOptions, dlqDispatcher, logger);

// const enrichmentRepo: EnrichmentRepo = {
//   async addHermeticity(hermeticity: MPPHermeticity): Promise<void> {
//     console.log(hermeticity);
//     return;
//   },

//   async addAlert(alert: MPPAlert): Promise<void> {
//     console.log(alert);
//     return;
//   },

//   async getAllEnrichment(): Promise<AllEnrichmentResponse> {
//     return {} as AllEnrichmentResponse;
//   }
// };

const enrichmentRepo: EnrichmentRepo = {
  async addHermeticity(Hermeticity: MPPHermeticity): Promise<void> {
    createConnection()
      .then(async connection => {
        return connection.manager.save(Hermeticity).then(examp => {
          console.log('Hermeticity has been saved. Hermeticity id is', Hermeticity.ID);
        });
      })
      .catch(error => console.log(error));
  },
  async addAlert(Alert: MPPAlert): Promise<void> {
    createConnection()
      .then(async connection => {
        return connection.manager.save(Alert).then(examp => {
          console.log('Alert has been saved. Alert id is', Alert.ID);
        });
      })
      .catch(error => console.log(error));
  },
  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    createConnection()
      .then(async connection => {
        const savedHermeticity = await getConnection().query('EXEC SelectAllActiveHermeticity', [5086]);
        const savedAlert = await getConnection().query('EXEC SelectAllActiveALert', [5086]);
        //const savedEnrichment: AllEnrichmentResponse = {["alert"]:savedAlert, ["hermeticity"]:savedHermeticity}
        return { ['alert']: savedAlert, ['hermeticity']: savedHermeticity } as AllEnrichmentResponse;
      })
      .catch(error => console.log(error));
  }
};
export { enrichmentConsumer, enrichmentRepo };
