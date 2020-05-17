/**
 * Responsible for running the application is server.ts file
 */
import app from './server';
import logger from '../logger';
import { startConsumingEnrichment } from '../api/kafka';
import { MPPHermeticity, HermeticityStatus, hermeticityType } from '../core/hermeticity';
import { MPPAlert, Severity, alertType } from '../core/alert';
import { AllEnrichmentResponse, EnrichmentRepo } from '../core/repository';
import { addEnrichment } from '../app/addEnrichment';
import { enrichmentRepo } from '../infrastructure/sql/enrichmentRepo';
import { createConnection, Connection } from 'typeorm';
import router from '../../src/api/getEnrichments';
import { SqlAlert } from '../../src/infrastructure/sql/sqlAlert';
import { SqlHermeticity } from '../../src/infrastructure/sql/sqlHermeticity';
import { Alert } from '../core/alert';
//import {sqlite} from 'sqlite';
//createConnection()

createConnection()
  // {type: "sqlite",
  //     database: ":memory:",
  //     dropSchema: true,
  //     entities: ["src/infrastructure/**/*.ts"],
  //     synchronize: true,
  //     logging: false}
  .then(async connection => {
    app.use('/api/v1', router);
    const PORT = process.env.APP_PORT || 4000;
    app.listen(PORT, function() {
      logger.info(`Listening on port ${PORT}`);
    });
    //console.log(await connection.manager.find(SqlAlert))
    //test.getAllEnrichment();
    //test.addAlert();
    //test.addHermeticity();

    //startConsumingEnrichment();
  })
  .catch(error => console.log('TypeORM connection error: ', error));

const test = {
  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    console.log(await enrichmentRepo.getAllEnrichment());
  },
  async addAlert(): Promise<AllEnrichmentResponse> {
    createConnection();
    const alert: MPPAlert = {
      timestampCreated: '2020-03-25T12:00:00Z',
      timestampMPP: '2020-03-25T12:00:00Z',
      origin: 'origin',
      node: 'node',
      type: alertType,
      severity: Severity.minor,
      ID: 'ID11',
      description: 'description',
      object: 'object',
      application: 'application',
      operator: 'operator'
    };

    addEnrichment(alert, enrichmentRepo);
  },
  async addHermeticity(): Promise<AllEnrichmentResponse> {
    const hermeticity: MPPHermeticity = {
      timestampCreated: '2020-03-25T12:00:00Z',
      timestampMPP: '2021-03-25T12:00:00Z',
      origin: 'origin',
      ID: 'ID15',
      type: hermeticityType,
      value: 100,
      beakID: 'beakID',
      status: HermeticityStatus.critical,
      hasAlert: true
    };
    //await createConnection()
    addEnrichment(hermeticity, enrichmentRepo);
  }
};

// const PORT = process.env.APP_PORT || 4000;
// app.listen(PORT, function() {
// logger.info(`Listening on port ${PORT}`);
// })
// //test.getAllEnrichment();
// //test.addAlert();
// test.addHermeticity();
