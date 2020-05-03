/**
 * Responsible for running the application is server.ts file
 */
import { getConnection } from 'typeorm';
import app from './server';
import logger from '../logger';
import { Hermeticity } from '../infrastructure/entitys/hermeticity';
import { createConnection } from 'typeorm';
import { MPPHermeticity, HermeticityStatus, hermeticityType } from '../core/hermeticity';
import { MPPAlert, Severity, alertType } from '../core/alert';
import { Alert } from '../infrastructure/entitys/alert';
import { AllEnrichmentResponse, EnrichmentRepo } from '../core/repository';

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

//check if evreting works//
/////////////////////////
const enrichment = new Hermeticity();
enrichment.timestampCreated = new Date(2020, 7, 4, 12, 30, 0, 0);
enrichment.timestampMPP = new Date(1776, 6, 4, 12, 30, 0, 0);
enrichment.origin = 'origin';
enrichment.ID = 'ID';
enrichment.type = hermeticityType;
enrichment.value = 100;
enrichment.beakID = 'beakID';
(enrichment.status = HermeticityStatus.critical), (enrichment.hasAlert = '1');

const alert = new Alert();
alert.timestampCreated = new Date(2020, 6, 4, 12, 30, 0, 0);
alert.timestampMPP = new Date(1776, 6, 4, 12, 30, 0, 0);
alert.origin = 'origin';
alert.node = 'node';
alert.type = alertType;
alert.severity = Severity.minor;
alert.ID = 'ID2';
alert.description = 'description';
alert.object = 'object';
alert.application = 'application';
alert.operator = 'operator';
//////////////////////
//enrichmentRepo.getAllEnrichment()
//addEnrichment(enrichment,enrichmentRepo )
//addEnrichment(alert,enrichmentRepo )

//startConsumingEnrichment();

const PORT = 4000;
app.listen(PORT, function() {
  logger.info(`Listening on port ${PORT}`);
});
