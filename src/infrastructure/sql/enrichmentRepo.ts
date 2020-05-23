import logger from '../../logger';
import { getConnection } from 'typeorm';
import { SqlHermeticity } from '../../infrastructure/sql/sqlHermeticity';
import { createConnection, getConnectionManager, ConnectionManager, Connection } from 'typeorm';
import { MPPHermeticity, Hermeticity } from '../../core/hermeticity';
import { MPPAlert, Alert } from '../../core/alert';
import { SqlAlert } from '../../infrastructure/sql/sqlAlert';
import { AllEnrichmentResponse, EnrichmentRepo } from '../../core/repository';
import { SqlFatalhError, SqlRetryableError } from '../../core/exc';

const errorTIMEOUT = 'ETIMEOUT';
async function createConection1() {
  await createConnection();
}

export const enrichmentRepo: EnrichmentRepo = {
  async addHermeticity(MPPHermeticity: MPPHermeticity): Promise<void> {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(SqlHermeticity)
        .values({
          timestamp: new Date(MPPHermeticity.timestamp),
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
      if (error.name === 'ConnectionError' || error.number === errorTIMEOUT || error.code === 'ENOCONN') {
        logger.info(`Hermeticity -Timeout or ConnectionError , try agein! the massage is: ${error}`);
        throw new SqlRetryableError(`Hermeticity - ${error}`, 1);
      } else {
        logger.info(`Hermeticity -I dont know what wrong, don't try agein! the massage is: ${error}`);
        throw new SqlFatalhError(`Hermeticity - ${error}`, 2);
      }
    }
  },
  async addAlert(MPPAlert: MPPAlert): Promise<void> {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(SqlAlert)
        .values({
          timestamp: new Date(MPPAlert.timestamp),
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
      if (error.name === 'ConnectionError' || error.number === errorTIMEOUT || error.code === 'ENOCONN') {
        logger.info(`Alert -Timeout or ConnectionError , try agein! the massage is: ${error}`);
        throw new SqlRetryableError(`Alert - ${error}`, 1);
      } else {
        logger.info(`Alert -I dont know what wrong, don't try agein! the massage is: ${error}`);
        throw new SqlFatalhError(`Alert - ${error}`, 2);
      }
    }
  },
  async getAllEnrichment(): Promise<AllEnrichmentResponse> {
    try {
      const savedHermeticity: Hermeticity[] = await getConnection().query('EXEC SelectAllActiveHermeticity', [5086]);
      const savedAlert: Alert[] = await getConnection().query('EXEC SelectAllActiveALert', [5086]);
      const savedEnrichment: AllEnrichmentResponse = { ['alert']: savedAlert, ['hermeticity']: savedHermeticity };
      return savedEnrichment;
    } catch (error) {
      logger.info(`Alert or Hermeticity -Timeout or ConnectionError , try agein! the massage is: ${error}`);
      throw new SqlFatalhError(`Alert or Hermeticity- ${error}`, 1);
    }
  }
};
