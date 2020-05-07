import logger from '../../logger';
import { getConnection } from 'typeorm';
import { SqlHermeticity } from '../../infrastructure/sql/sqlHermeticity';
import { createConnection } from 'typeorm';
import { MPPHermeticity, Hermeticity } from '../../core/hermeticity';
import { MPPAlert, Alert } from '../../core/alert';
import { SqlAlert } from '../../infrastructure/sql/sqlAlert';
import { AllEnrichmentResponse, EnrichmentRepo } from '../../core/repository';

export const enrichmentRepo: EnrichmentRepo = {
  async addHermeticity(MPPHermeticity: MPPHermeticity): Promise<void> {
    try {
      const sqlHermeticity = new SqlHermeticity();
      sqlHermeticity.timestampCreated = new Date(MPPHermeticity.timestampCreated);
      sqlHermeticity.timestampMPP = new Date(MPPHermeticity.timestampCreated);
      sqlHermeticity.origin = MPPHermeticity.origin;
      sqlHermeticity.ID = MPPHermeticity.ID;
      sqlHermeticity.value = MPPHermeticity.value;
      sqlHermeticity.beakID = MPPHermeticity.beakID;
      sqlHermeticity.status = MPPHermeticity.status;
      sqlHermeticity.hasAlert = MPPHermeticity.hasAlert.toString();
      await createConnection();
      await getConnection().manager.save(sqlHermeticity);
      logger.info('Hermeticity has been saved');
    } catch (error) {
      console.log(error);
    }
  },
  async addAlert(MPPAlert: MPPAlert): Promise<void> {
    try {
      await createConnection();
      const sqlAlert = new SqlAlert();
      sqlAlert.timestampCreated = new Date(MPPAlert.timestampCreated);
      sqlAlert.timestampMPP = new Date(MPPAlert.timestampMPP);
      sqlAlert.origin = MPPAlert.origin;
      sqlAlert.node = MPPAlert.node;
      sqlAlert.severity = MPPAlert.severity;
      sqlAlert.ID = MPPAlert.ID;
      sqlAlert.description = MPPAlert.description;
      sqlAlert.object = MPPAlert.object;
      sqlAlert.application = MPPAlert.application;
      sqlAlert.operator = MPPAlert.operator;
      try {
        await getConnection().manager.save(sqlAlert);
      } catch (error) {
        console.log('in error');
      }

      logger.info('Alert has been saved');
    } catch (error) {
      console.log(error);
    }
  },
  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    try {
      await createConnection();
      const savedHermeticity: Hermeticity[] = await getConnection().query('EXEC SelectAllActiveHermeticity', [5086]);
      const savedAlert: Alert[] = await getConnection().query('EXEC SelectAllActiveALert', [5086]);
      const savedEnrichment: AllEnrichmentResponse = { ['alert']: savedAlert, ['hermeticity']: savedHermeticity };
      return savedEnrichment;
    } catch (error) {
      console.log(error);
    }
  }
};
