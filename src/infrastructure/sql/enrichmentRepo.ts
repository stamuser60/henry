import Logger from '../../logger';
import { getConnection, Connection, getManager } from 'typeorm';
import { Hermeticity } from '../../infrastructure/sql/hermeticity';
import { createConnection } from 'typeorm';
import { MPPHermeticity, HermeticityStatus, hermeticityType } from '../../core/hermeticity';
import { MPPAlert, Severity, alertType } from '../../core/alert';
import { Alert } from '../../infrastructure/sql/alert';
import { AllEnrichmentResponse, EnrichmentRepo } from '../../core/repository';

export const enrichmentRepo: EnrichmentRepo = {
  async addHermeticity(MPPHermeticity: MPPHermeticity): Promise<void> {
    try {
      await createConnection();
      const hermeticity = new Hermeticity();
      hermeticity.timestampCreated = new Date(MPPHermeticity.timestampCreated.toString());
      hermeticity.timestampMPP = new Date(MPPHermeticity.timestampCreated.toString());
      hermeticity.origin = MPPHermeticity.origin;
      hermeticity.ID = MPPHermeticity.ID;
      hermeticity.value = MPPHermeticity.value;
      hermeticity.beakID = MPPHermeticity.beakID;
      hermeticity.status = MPPHermeticity.status;
      hermeticity.hasAlert = MPPHermeticity.hasAlert;
      await getConnection().manager.save(hermeticity);
      Logger.info('Hermeticity has been saved');
    } catch (error) {
      console.log(error);
    }
  },
  async addAlert(MPPAlert: MPPAlert): Promise<void> {
    try {
      await createConnection();
      const alert = new Alert();
      alert.timestampCreated = new Date(MPPAlert.timestampCreated);
      alert.timestampMPP = new Date(MPPAlert.timestampMPP);
      alert.origin = MPPAlert.origin;
      alert.node = MPPAlert.node;
      alert.severity = MPPAlert.severity;
      alert.ID = MPPAlert.ID;
      alert.description = MPPAlert.description;
      alert.object = MPPAlert.object;
      alert.application = MPPAlert.application;
      alert.operator = MPPAlert.operator;
      await getConnection().manager.save(alert);
      Logger.info('Alert has been saved');
    } catch (error) {
      console.log(error);
    }
  },
  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    try {
      await createConnection();
      const savedHermeticity = await getConnection().query('EXEC SelectAllActiveHermeticity', [5086]);
      const savedAlert = await getConnection().query('EXEC SelectAllActiveALert', [5086]);
      const savedEnrichment: AllEnrichmentResponse = { ['alert']: savedAlert, ['hermeticity']: savedHermeticity };
      return savedEnrichment;
    } catch (error) {
      console.log(error);
    }
  }
};
