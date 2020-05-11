import logger from '../../logger';
import { getConnection } from 'typeorm';
import { SqlHermeticity } from '../../infrastructure/sql/sqlHermeticity';
import { createConnection } from 'typeorm';
import { MPPHermeticity, Hermeticity } from '../../core/hermeticity';
import { MPPAlert, Alert } from '../../core/alert';
import { SqlAlert } from '../../infrastructure/sql/sqlAlert';
import { AllEnrichmentResponse, EnrichmentRepo } from '../../core/repository';
import { SqlFatalhError, SqlRetryableError } from '../../core/exc';

const errorTIMEOUT = 'ETIMEOUT';

export const enrichmentRepo: EnrichmentRepo = {
  async addHermeticity(MPPHermeticity: MPPHermeticity): Promise<void> {
    try {
      await createConnection();
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(SqlHermeticity)
        .values({
          timestampCreated: new Date(MPPHermeticity.timestampCreated),
          timestampMPP: new Date(MPPHermeticity.timestampMPP),
          origin: MPPHermeticity.origin,
          value: MPPHermeticity.value,
          beakID: MPPHermeticity.beakID,
          ID: MPPHermeticity.ID,
          status: MPPHermeticity.status,
          hasAlert: MPPHermeticity.hasAlert.toString()
        })
        .execute();
      logger.info('Hermeticity has been saved');
    } catch (error) {
      if (error.name === 'ConnectionError' || error.number === errorTIMEOUT) {
        logger.info(`Hermeticity -Timeout or ConnectionError , try agein! the massage is: ${error}`);
        throw new SqlRetryableError(`Hermeticity - ${error.originalError.info.message}`, 1);
      } else {
        logger.info(
          `Hermeticity -I dont know what wrong, don't try agein! the massage is: ${error.originalError.info.message}`
        );
        throw new SqlFatalhError(`Hermeticity - ${error.originalError.info.message}`, 2);
      }
    }
  },
  async addAlert(MPPAlert: MPPAlert): Promise<void> {
    try {
      await createConnection();
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(SqlAlert)
        .values({
          timestampCreated: new Date(MPPAlert.timestampCreated),
          timestampMPP: new Date(MPPAlert.timestampMPP),
          origin: MPPAlert.origin,
          node: MPPAlert.node,
          severity: MPPAlert.severity,
          ID: MPPAlert.ID,
          description: MPPAlert.description,
          object: MPPAlert.object,
          application: MPPAlert.application,
          operator: MPPAlert.operator
        })
        .execute();
      logger.info('Alert has been saved');
    } catch (error) {
      if (error.name === 'ConnectionError' || error.number === errorTIMEOUT) {
        logger.info(`Alert -Timeout or ConnectionError , try agein! the massage is: ${error}`);
        throw new SqlRetryableError(`Alert - ${error.originalError.info.message}`, 1);
      } else {
        logger.info(
          `Alert -I dont know what wrong, don't try agein! the massage is: ${error.originalError.info.message}`
        );
        throw new SqlFatalhError(`Alert - ${error.originalError.info.message}`, 2);
      }
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
      logger.info(`Alert or Hermeticity -Timeout or ConnectionError , try agein! the massage is: ${error}`);
      throw new SqlRetryableError(`Alert or Hermeticity- ${error}`, 1);
    }
  }
};
