import { MPPAlert, Severity, alertType } from '../src/core/alert';
import { expect } from 'chai';
import { SqlAlert } from '../src/infrastructure/sql/sqlAlert';
import { enrichmentRepo } from '../src/infrastructure/sql/enrichmentRepo';
import { MPPHermeticity, HermeticityStatus, hermeticityType } from '../src/core/hermeticity';
import { getConnection, createConnection, Connection } from 'typeorm';
import { SqlHermeticity } from '../src/infrastructure/sql/sqlHermeticity';
import { AllEnrichmentResponse } from '../src/core/repository';
import {
  alert,
  hermeticity,
  alertWitoutNode,
  hermeticityWitoutTimestampCreated,
  hermeticityWithWeongTimestampCreated,
  deleteFromDB
} from './testConfig';
import equal from 'deep-equal';
//const equal = require('deep-equal');

export let connection: Connection;

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
    it('in Alert, the colume timestampCreated Should be accepted from kafka as "string" but be insetred to the db as "date" ', async function() {
      await enrichmentRepo.addAlert(alert);
      const findAlert = (await connection
        .getRepository(SqlAlert)
        .createQueryBuilder('SqlAlert')
        .where('id = :id', { id: alert.ID })
        .getOne()) as SqlAlert;
      deleteFromDB('SqlAlert', alert.ID);
      expect(Object.prototype.toString.call(findAlert.timestamp)).to.be.eq('[object Date]');
    });

    it('in Alert, if While kafka trying to insert to the db , and the db is down we well chace the error "sqlretrayerror ', async function() {
      await connection.close();
      try {
        await enrichmentRepo.addAlert(alert);
      } catch (error) {
        expect(error.status).to.be.eq(1);
      }
      connection = await createConnection();
    });

    it('in Alert, if While kafka trying to insert to the db , and the db is slow we well chace the error "sqlretrayerror ', async function() {
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
      await queryRunner.query('SELECT * FROM alert WITH (TABLOCK, HOLDLOCK)');
      try {
        await enrichmentRepo.addAlert(alert);
      } catch (error) {
        expect(error.status).to.be.eq(1);
      }
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      await connectionForInsert.close();
    });

    it('in Alert, if While inserting ,the values dont have the right structure we will get "sqlfatalerror" ', async function() {
      try {
        await enrichmentRepo.addAlert(alertWitoutNode as MPPAlert);
      } catch (error) {
        expect(error.status).to.be.eq(2);
      }
    });
    it('in Alert, if While inserting ,one of the columes values is not mach the table structure we will get "sqlfatalerror" ', async function() {
      try {
        await enrichmentRepo.addAlert(alertWitoutNode as MPPAlert);
      } catch (error) {
        expect(error.status).to.be.eq(2);
      }
    });
  });

  describe('Hermeticity', function() {
    it('in Hermeticity, the colume timestampCreated Should be accepted from kafka as "string" but be insetred to the db as "date" ', async function() {
      await enrichmentRepo.addHermeticity(hermeticity);
      const findHermeticity = (await connection
        .getRepository(SqlHermeticity)
        .createQueryBuilder('SqlHermeticity')
        .where('id = :id', { id: hermeticity.ID })
        .getOne()) as SqlHermeticity;
      deleteFromDB('SqlHermeticity', hermeticity.ID);
      expect(Object.prototype.toString.call(findHermeticity.timestamp)).to.be.eq('[object Date]');
    });

    it('in Hermeticity, the colume hasAlert Should be accepted from kafka as "boolean" but be insetred to the db as "string"  ', async function() {
      await enrichmentRepo.addHermeticity(hermeticity);
      const findHermeticity = (await connection
        .getRepository(SqlHermeticity)
        .createQueryBuilder('SqlHermeticity')
        .where('id = :id', { id: hermeticity.ID })
        .getOne()) as SqlHermeticity;
      deleteFromDB('SqlHermeticity', hermeticity.ID);
      expect(typeof findHermeticity.hasAlert).to.be.eq('string');
    });

    it('in Hermeticity, if While kafka trying to insert to the db , and the db is down we well chace the error "sqlretrayerror ', async function() {
      await connection.close();
      try {
        await enrichmentRepo.addHermeticity(hermeticity);
      } catch (error) {
        expect(error.status).to.be.eq(1);
      }
      connection = await createConnection();
    });

    it('in Hermeticity, if While kafka trying to insert to the db , and the db is slow we well chace the error "sqlretrayerror ', async function() {
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
          expect(error.status).to.be.eq(1);
        }
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
      connectionForInsert.close();
    });

    it('in Hermeticity, if While inserting ,the values dont have the right structure we will get "sqlfatalerror" ', async function() {
      try {
        await enrichmentRepo.addHermeticity(hermeticityWitoutTimestampCreated as MPPHermeticity);
      } catch (error) {
        expect(error.status).to.be.eq(2);
      }
    });

    it('in Hermeticity, if While inserting ,one of the columes values is not mach the table structure we will get "sqlfatalerror" ', async function() {
      try {
        await enrichmentRepo.addHermeticity(hermeticityWithWeongTimestampCreated as MPPHermeticity);
      } catch (error) {
        expect(error.status).to.be.eq(2);
      }
    });
  });

  describe('getAllEnrichment', function() {
    it('in getAllEnrichment, if While kafka trying to select from the db , and the db is dowen we well chace the error "sqlretrayerror  ', async function() {
      await connection.close();
      try {
        await enrichmentRepo.getAllEnrichment();
      } catch (error) {
        expect(error.status).to.be.eq(1);
      }
      connection = await createConnection();
    });

    it('in getAllEnrichment, checing thst the structure thet returns from the faunction is in the correct structure, even if the table is empty', async function() {
      let AllEnrichment = { ['alert']: [], ['hermeticity']: [] } as AllEnrichmentResponse;
      deleteFromDB('SqlHermeticity', 'deleteAllTheTable');
      deleteFromDB('SqlAlert', 'deleteAllTheTable');
      AllEnrichment = await enrichmentRepo.getAllEnrichment();
      if (equal([], AllEnrichment.alert)) {
        expect(1).to.be.eq(1);
      }
    });
    it('in getAllEnrichment, checing thst the structure thet returns from the faunction is in the correct structure when the table is full', async function() {
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
