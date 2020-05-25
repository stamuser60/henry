import { MPPAlert, Severity, alertType } from '../src/core/alert';
import { expect } from 'chai';
import { SqlAlert } from '../src/infrastructure/sql/sqlAlert';
import { enrichmentRepo } from '../src/infrastructure/sql/enrichmentRepo';
import { MPPHermeticity, HermeticityStatus, hermeticityType } from '../src/core/hermeticity';
import { getConnection, createConnection, Connection } from 'typeorm';
import { SqlHermeticity } from '../src/infrastructure/sql/sqlHermeticity';
import { AllEnrichmentResponse } from '../src/core/repository';
import {equal} from 'deep-equal';

let connection: Connection;
const alert: MPPAlert = {
  timestamp: '2020-03-25T12:00:00Z',
  origin: 'origin',
  node: 'node',
  type: alertType,
  severity: Severity.minor,
  ID: 'ID16',
  description: 'description',
  object: 'object',
  application: 'application',
  operator: 'operator'
};

const hermeticity: MPPHermeticity = {
  timestamp: '2020-03-25T12:00:00Z',
  origin: 'origin',
  ID: 'ID129',
  type: hermeticityType,
  value: 100,
  beakID: 'beakID',
  status: HermeticityStatus.critical,
  hasAlert: true
};

describe('core', function() {
  this.timeout(100000);
  beforeEach(function() {
    return new Promise(resolve => {
      createConnection().then(connectionToDB => {
        connection = connectionToDB;
        resolve();
      });
    });
  });
  afterEach(function() {
    return new Promise(resolve => {
      connection.close().then(connectionToDB => {
        resolve();
      });
    });
  });

  describe('Alert', function() {
    it('in Alert, showd get to insert timestampCreated and timestampMPP as string and insert as DATE ', async function() {
      await enrichmentRepo.addAlert(alert);
      const findAlert = (await connection
        .getRepository(SqlAlert)
        .createQueryBuilder('SqlAlert')
        .where('id = :id', { id: alert.ID })
        .getOne()) as SqlAlert;
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(SqlAlert)
        .where('id = :id', { id: alert.ID })
        .execute();
      expect(Object.prototype.toString.call(findAlert.timestamp)).to.be.eq('[object Date]');
    });

    it('in Alert, if whele inserting the db is down the error is "sqlretrayerror ', async function() {
      let errorStatus = 0;
      await connection.close();
      try {
        await enrichmentRepo.addAlert(alert);
      } catch (error) {
        errorStatus = error.status;
      }
      connection = await createConnection();
      expect(errorStatus).to.be.eq(1);
    });

    it('in Alert, if whele inserting the db is so slow the insert is failing the error is "sqlretrayerror ', async function() {
      let errorStatus = 0;
      const connectionForInsert = await createConnection({
        name: 'connectionForInsert',
        type: 'mssql',
        host: 'localhost',
        port: 49672,
        username: 'login2',
        password: 'login2',
        database: 'emiDB',
        entities: [SqlAlert]
      });
      const queryRunner = connectionForInsert.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.query('SELECT * FROM alert WITH (TABLOCK, HOLDLOCK)');
        try {
          await enrichmentRepo.addAlert(alert);
        } catch (error) {
          errorStatus = error.status;
        }
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
      await connectionForInsert.close();
      expect(errorStatus).to.be.eq(1);
    });

    it('in Alert, if whele inserting the MPPAlert dont have the right stachar we will get "sqlfatalerror" ', async function() {
      let errorStatus = 0;
      const alertWitoutNode = {
        origin: 'origin',
        type: alertType,
        node: 'node',
        severity: Severity.minor,
        ID: 'ID15',
        description: 'description',
        object: 'object',
        application: 'application',
        operator: 'operator'
      };
      try {
        await enrichmentRepo.addAlert(alertWitoutNode as MPPAlert);
      } catch (error) {
        errorStatus = error.status;
      }
      expect(errorStatus).to.be.eq(2);
    });
    it('in Alert, if whele inserting the MPPAlert bad values we will get "sqlfatalerror" ', async function() {
      let errorStatus = 0;
      const alertWitoutNode = {
        timestamp: '2020123-03-25T12:00:00Z',
        origin: 'origin',
        type: alertType,
        node: 'node',
        severity: Severity.minor,
        ID: 'ID15',
        description: 'description',
        object: 'object',
        application: 'application',
        operator: 'operator'
      };
      try {
        await enrichmentRepo.addAlert(alertWitoutNode as MPPAlert);
      } catch (error) {
        errorStatus = error.status;
      }

      expect(errorStatus).to.be.eq(2);
    });
  });

  describe('Hermeticity', function() {
    it('in Hermeticity, showd get to insert timestampCreated and timestampMPP as string and insert as DATE ', async function() {
      await enrichmentRepo.addHermeticity(hermeticity);
      const findHermeticity = (await connection
        .getRepository(SqlHermeticity)
        .createQueryBuilder('SqlHermeticity')
        .where('id = :id', { id: hermeticity.ID })
        .getOne()) as SqlHermeticity;
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(SqlHermeticity)
        .where('id = :id', { id: hermeticity.ID })
        .execute();
      expect(Object.prototype.toString.call(findHermeticity.timestamp)).to.be.eq('[object Date]');
    });

    it('in Hermeticity, showd get to insert hasAlert as boolean and insert as string ', async function() {
      await enrichmentRepo.addHermeticity(hermeticity);
      const findHermeticity = (await connection
        .getRepository(SqlHermeticity)
        .createQueryBuilder('SqlHermeticity')
        .where('id = :id', { id: hermeticity.ID })
        .getOne()) as SqlHermeticity;
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(SqlHermeticity)
        .where('id = :id', { id: hermeticity.ID })
        .execute();
      expect(typeof findHermeticity.hasAlert).to.be.eq('string');
    });

    it('in Hermeticity, if whele inserting the db is down the error is "sqlretrayerror ', async function() {
      let errorStatus = 0;
      await connection.close();
      try {
        await enrichmentRepo.addHermeticity(hermeticity);
      } catch (error) {
        errorStatus = error.status;
      }
      connection = await createConnection();
      expect(errorStatus).to.be.eq(1);
    });

    it('in Hermeticity, if whele inserting the db is so slow the insert is failing the error is "sqlretrayerror ', async function() {
      let errorStatus = 0;
      const connectionForInsert = await createConnection({
        name: 'connectionForInsert',
        type: 'mssql',
        host: 'localhost',
        port: 49672,
        username: 'login2',
        password: 'login2',
        database: 'emiDB',
        entities: [SqlHermeticity]
      });
      const queryRunner = connectionForInsert.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.query('SELECT * FROM Hermeticity WITH (TABLOCK, HOLDLOCK)');
        try {
          await enrichmentRepo.addHermeticity(hermeticity);
        } catch (error) {
          errorStatus = error.status;
        }
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
      connectionForInsert.close();
      expect(errorStatus).to.be.eq(1);
    });

    it('in Hermeticity, if whele inserting the MPPHermeticity dont have the right stachar we will get "sqlfatalerror" ', async function() {
      let errorStatus = 0;
      const hermeticityWitoutTimestampCreated = {
        origin: 'origin',
        ID: 'ID129',
        type: hermeticityType,
        value: 100,
        beakID: 'beakID',
        status: HermeticityStatus.critical,
        hasAlert: true
      };
      try {
        await enrichmentRepo.addHermeticity(hermeticityWitoutTimestampCreated as MPPHermeticity);
      } catch (error) {
        errorStatus = error.status;
      }

      expect(errorStatus).to.be.eq(2);
    });

    it('in Hermeticity, if whele inserting the MPPAlert bad values we will get "sqlfatalerror" ', async function() {
      let errorStatus = 0;
      const hermeticityWitoutTimestampCreated = {
        timestamp: '2020223-03-25T12:00:00Z',
        origin: 'origin',
        ID: 'ID129',
        type: hermeticityType,
        value: 100,
        beakID: 'beakID',
        status: HermeticityStatus.critical,
        hasAlert: true
      };
      try {
        await enrichmentRepo.addHermeticity(hermeticityWitoutTimestampCreated as MPPHermeticity);
      } catch (error) {
        errorStatus = error.status;
      }
      expect(errorStatus).to.be.eq(2);
    });
  });

  describe('getAllEnrichment', function() {
    it('in getAllEnrichment, if whele selecting the db is down the error is "sqlretrayerror ', async function() {
      console.log('in 3.1 test');
      let errorStatus = 0;
      await connection.close();
      try {
        await enrichmentRepo.getAllEnrichment();
      } catch (error) {
        errorStatus = error.status;
      }
      connection = await createConnection();
      expect(errorStatus).to.be.eq(1);
    });

    it('in getAllEnrichment, checing thst the stacter thet returns from the faunction is in the correct srachar when the table is empty', async function() {
      let AllEnrichment = { ['alert']: [], ['hermeticity']: [] } as AllEnrichmentResponse;
      try {
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(SqlHermeticity)
          .execute();
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(SqlAlert)
          .execute();
        AllEnrichment = await enrichmentRepo.getAllEnrichment();
      } catch (err) {
        console.log(err);
      }
      const emptyArray: [] = [];
      if (equal(emptyArray, AllEnrichment.alert)) {
        expect(1).to.be.eq(1);
      } else {
        expect(1).to.be.eq(2);
      }
    });
    it('in getAllEnrichment, checing thst the stacter thet returns from the faunction is in the correct srachar when the table is full', async function() {
      let AllEnrichment = { ['alert']: [], ['hermeticity']: [] } as AllEnrichmentResponse;
      try {
        await enrichmentRepo.addAlert(alert);
        await enrichmentRepo.addHermeticity(hermeticity);
        AllEnrichment = await enrichmentRepo.getAllEnrichment();
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(SqlAlert)
          .where('id = :id', { id: alert.ID })
          .execute();
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(SqlHermeticity)
          .where('id = :id', { id: hermeticity.ID })
          .execute();
      } catch (err) {
        console.log(err);
      }
      let allGood = 'yes';
      if (AllEnrichment.alert != undefined && AllEnrichment.hermeticity != undefined) {
        AllEnrichment.alert.forEach(element => {
          if (
            element.keyId == undefined ||
            element.LastAlertDT == undefined ||
            element.FirstNotNormalDT == undefined ||
            element.origin == undefined ||
            element.node == undefined ||
            element.severity == undefined ||
            element.description == undefined ||
            element.object == undefined ||
            element.application == undefined ||
            element.operator == undefined ||
            element.ID == undefined
          ) {
            allGood = 'no';
          }
        });

        AllEnrichment.hermeticity.forEach(element => {
          if (
            element.beakID == undefined ||
            element.LasthermeticityDT == undefined ||
            element.FirstNotNormalDT == undefined ||
            element.origin == undefined ||
            element.status == undefined ||
            element.hasAlert == undefined ||
            element.value == undefined ||
            element.Id == undefined
          ) {
            console.log('in test 2', element, allGood);
            allGood = 'no';
          }
        });
      } else {
        allGood = 'no';
      }
      expect(allGood).to.be.eq('yes');
    });
  });
});
