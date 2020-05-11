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

//check if evreting works
const test = {
  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    console.log(await enrichmentRepo.getAllEnrichment());
  },
  async addAlert(): Promise<AllEnrichmentResponse> {
    const alert: MPPAlert = {
      timestampCreated: '2020-03-25T12:00:00Z',
      timestampMPP: '2020-03-25T12:00:00Z',
      origin: 'origin',
      node: 'node',
      type: alertType,
      severity: Severity.minor,
      ID: 'ID8',
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
      ID: 'ID4',
      type: hermeticityType,
      value: 100,
      beakID: 'beakID',
      status: HermeticityStatus.critical,
      hasAlert: true
    };
    addEnrichment(hermeticity, enrichmentRepo);
  }
};

test.getAllEnrichment();
//test.addAlert();
//test.addHermeticity();

//startConsumingEnrichment();

const PORT = process.env.APP_PORT || 4000;
app.listen(PORT, function() {
  logger.info(`Listening on port ${PORT}`);
});
