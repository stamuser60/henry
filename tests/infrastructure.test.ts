require('dotenv/config');
import {
  invalidStructureAlertReceived,
  invalidStructureHermeticityReceived,
  mppAlert,
  mppHermeticity
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
} from './testConfig';
import { CprLogger } from '@stamscope/jslogger';
import sinon, { SinonSandbox } from 'sinon';
import { createConnection, getConnection, Connection } from 'typeorm';
import { expect } from 'chai';
import { Readable, ReadableOptions } from 'stream';
import logger from '../src/logger';
import { ConsumerGroupStream, Message, Producer } from 'kafka-node';
import { KafkaEnrichmentDispatcher } from '../src/infrastructure/kafkaDispatcher';
import { KafkaEnrichmentConsumer } from '../src/infrastructure/kafkaConsumer';
import { Incident } from '../src/core/dataItem';
import { incidentRepo } from '../src/infrastructure/sql/incidentRepo';
import { AlertSchema, HermeticitySchema } from '../src/infrastructure/schemaGenerator';
import { Schema, Validator } from 'jsonschema';
import { HermeticityStatus, hermeticityType, ProcessedHermeticityEnrichment } from '../src/core/hermeticity';
import { SqlAlert } from '../src/infrastructure/sql/sqlAlert';
import { alertType, ProcessedAlertEnrichment, Severity } from '../src/core/alert';
import { SqlHermeticity } from '../src/infrastructure/sql/sqlHermeticity';

/**
 * A class to create test readable streams,
 * by default it wont destroy itself.
 */
class TestStream extends Readable {
  constructor(opt?: ReadableOptions) {
    if (opt) {
      super(opt);
    } else {
      super({ autoDestroy: false });
    }
  }

  _read(): void {
    return;
  }
}

const msg: Message = {
  topic: 'test',
  value: `{"test": "test message"}`
};

describe('Infrastructure', function() {
  const sandbox: SinonSandbox = sinon.createSandbox();
  let stubbedLogger: CprLogger;
  let kafkaEnrichmentDispatcher: KafkaEnrichmentDispatcher;
  let kafkaConsumer: KafkaEnrichmentConsumer;
  let dlqDispatcher: KafkaEnrichmentDispatcher;
  let kafkaProducer: Producer;
  let kafkaDlqProducer: Producer;
  let consumerGroupStream: ConsumerGroupStream;
  let onMessageCallback: (message: object | object[]) => Promise<void>;

  let schemaValidator: Validator;
  const jsonSchemaOptions = { throwError: true };

  beforeEach(function() {
    // disable logging
    stubbedLogger = (sandbox.stub(logger) as unknown) as CprLogger;
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('KafkaEnrichmentDispatcher', function() {
    beforeEach(function() {
      kafkaProducer = {} as Producer;
      kafkaProducer.send = sandbox.stub();
      (kafkaProducer.send as any).callsFake((payloads: any, cb: any) => cb());

      kafkaEnrichmentDispatcher = new KafkaEnrichmentDispatcher('test', kafkaProducer, 'test', stubbedLogger);
    });
    it('should call send function on producer passed to it', async function() {
      await kafkaEnrichmentDispatcher.send([{} as Incident]);
      expect((kafkaProducer.send as any).calledOnce).to.be.true;
    });
    it('should retry `send` function 2 times before rethrowing the error', async function() {
      (kafkaProducer as any).send.throws();
      try {
        await kafkaEnrichmentDispatcher.send([{} as Incident]);
      } catch (e) {
        expect((kafkaProducer.send as any).callCount).to.be.eq(3);
        return;
      }
      throw Error('No exception thrown');
    });
  });
  describe('KafkaEnrichmentConsumer', function() {
    beforeEach(function() {
      kafkaDlqProducer = {} as Producer;
      kafkaDlqProducer.send = sandbox.stub();
      (kafkaDlqProducer.send as any).callsFake((payloads: any, cb: any) => cb());

      dlqDispatcher = new KafkaEnrichmentDispatcher('test', kafkaProducer, 'test', stubbedLogger);

      consumerGroupStream = (new TestStream() as unknown) as ConsumerGroupStream;
      consumerGroupStream.commit = sandbox.stub();
      kafkaConsumer = new KafkaEnrichmentConsumer('test', consumerGroupStream, dlqDispatcher, stubbedLogger);

      onMessageCallback = sandbox.stub();
      kafkaConsumer.start(onMessageCallback);
    });
    afterEach(function() {
      consumerGroupStream.destroy();
    });

    it('should subscribe to `data` event', function() {
      expect(consumerGroupStream.listenerCount('data')).to.be.eq(1);
    });
    it('should call `onMessage` function when `data` event emitted', function() {
      consumerGroupStream.emit('data', msg);
      expect((onMessageCallback as any).calledOnce).to.be.true;
    });
    it('should pass parsed value of the kafka message object to the `onMessage` function', function() {
      consumerGroupStream.emit('data', msg);
      const parsedMsgValue = JSON.parse(msg.value as string);
      const parsedMsgValueStringified = JSON.stringify(parsedMsgValue);
      const parsedValuedStringified = JSON.stringify((onMessageCallback as any).getCall(0).args[0]);
      expect(parsedMsgValueStringified).to.be.eq(parsedValuedStringified);
    });
    it('should send to DLQ if value emitted on `data` event is not json', function() {
      const spy = sinon.spy(kafkaConsumer, 'sendToDLQ');
      consumerGroupStream.emit('data', 'not json!');
      expect(spy.calledOnce).to.be.true;
    });
    it('should commit msg received if `onMessage` did not throw error', function() {
      consumerGroupStream.emit('data', msg);
      // setTimeout here is because there is async behaviour which we need to wait for to happen
      setTimeout(() => {
        expect((consumerGroupStream as any).commit.calledOnce).to.be.true;
      }, 1000);
    });
    it('should when data is problematic (not json) it should call sendToDLQ, then commit, then resume', function() {
      const spySendToDLQ = sinon.spy(kafkaConsumer, 'sendToDLQ');
      const spyResume = sinon.spy(consumerGroupStream, 'resume');
      consumerGroupStream.emit('data', 'not json!');
      setTimeout(() => {
        expect((consumerGroupStream.commit as any).calledAfter(spySendToDLQ)).to.be.true;
        expect(spyResume.calledAfter(consumerGroupStream.commit as any)).to.be.true;
      }, 1000);
    });
  });
  describe('schemaGenerator', function() {
    beforeEach(function() {
      schemaValidator = new Validator();
    });
    describe('alert schema', function() {
      it('should not throw any error if passed alert received', function() {
        schemaValidator.validate(mppAlert, AlertSchema as Schema, jsonSchemaOptions);
      });
      it('should throw error data passed is not compliant with `AlertReceived` interface', function(done) {
        try {
          schemaValidator.validate(invalidStructureAlertReceived, AlertSchema as Schema, jsonSchemaOptions);
        } catch (e) {
          done();
          return;
        }
        done('No error thrown');
      });
    });
    describe('hermeticity schema', function() {
      it('should not throw any error if passed hermeticity received', function() {
        schemaValidator.validate(mppHermeticity, HermeticitySchema as Schema, jsonSchemaOptions);
      });
      it('should throw error data passed is not compliant with `HermeticityReceived` interface', function(done) {
        try {
          schemaValidator.validate(invalidStructureHermeticityReceived, HermeticitySchema as Schema, jsonSchemaOptions);
        } catch (e) {
          done();
          return;
        }
        done('No error thrown');
      });
    });
  });
  describe('Typeorm', function() {
    let connection: Connection;
    const alert: ProcessedAlertEnrichment = {
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

    const hermeticity: ProcessedHermeticityEnrichment = {
      timestamp: '2020-03-25T12:00:00Z',
      origin: 'origin',
      ID: 'ID129',
      type: hermeticityType,
      value: 100,
      beakID: 'beakID',
      status: HermeticityStatus.critical,
      hasAlert: true
    };
    beforeEach(function() {
      return new Promise(resolve => {
        createConnection().then(connectionToDB => {
          console.log('before each');
          connection = connectionToDB;
          resolve();
        });
      });
    });
    afterEach(function() {
      return new Promise(resolve => {
        console.log('afterEach');
        connection.close().then(connectionToDB => {
          resolve();
        });
      });
    });
    describe('Alert', function() {
      it('in Alert, showd get to insert timestampCreated and timestampMPP as string and insert as DATE ', async function() {
        await incidentRepo.addAlert(alert);
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
          await incidentRepo.addAlert(alert);
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
            await incidentRepo.addAlert(alert);
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

      it('in Alert, if whele inserting the ProcessedAlertEnrichment dont have the right stachar we will get "sqlfatalerror" ', async function() {
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
          await incidentRepo.addAlert(alertWitoutNode as ProcessedAlertEnrichment);
        } catch (error) {
          errorStatus = error.status;
        }

        expect(errorStatus).to.be.eq(2);
      });
      it('in Alert, if whele inserting the ProcessedAlertEnrichment bad values we will get "sqlfatalerror" ', async function() {
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
          await incidentRepo.addAlert(alertWitoutNode as ProcessedAlertEnrichment);
        } catch (error) {
          errorStatus = error.status;
        }

        expect(errorStatus).to.be.eq(2);
      });
    });
    describe('Hermeticity', function() {
      it('in Hermeticity, showd get to insert timestampCreated and timestampMPP as string and insert as DATE ', async function() {
        await incidentRepo.addHermeticity(hermeticity);
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
        await incidentRepo.addHermeticity(hermeticity);
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
          await incidentRepo.addHermeticity(hermeticity);
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
            await incidentRepo.addHermeticity(hermeticity);
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

      it('in Hermeticity, if whele inserting the ProcessedHermeticityEnrichment dont have the right stachar we will get "sqlfatalerror" ', async function() {
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
          await incidentRepo.addHermeticity(hermeticityWitoutTimestampCreated as ProcessedHermeticityEnrichment);
        } catch (error) {
          errorStatus = error.status;
        }

        expect(errorStatus).to.be.eq(2);
      });

      it('in Hermeticity, if whele inserting the ProcessedAlertEnrichment bad values we will get "sqlfatalerror" ', async function() {
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
          await incidentRepo.addHermeticity(hermeticityWitoutTimestampCreated as ProcessedHermeticityEnrichment);
        } catch (error) {
          errorStatus = error.status;
        }

        expect(errorStatus).to.be.eq(2);
      });
    });

    describe('getAllEnrichment', function() {
      it('in getAllEnrichment, if whele selecting the db is down the error is "sqlretrayerror ', async function() {
        let errorStatus = 0;

        await connection.close();
        try {
          await incidentRepo.getAllEnrichment();
        } catch (error) {
          errorStatus = error.status;
        }
        connection = await createConnection();
        expect(errorStatus).to.be.eq(1);
      });

      it('in getAllEnrichment, checing thst the stacter thet returns from the faunction is in the correct srachar', async function() {
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
        const queryRunner = connection.createQueryRunner();
        let AllEnrichment;
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from(SqlAlert)
            .execute();
          try {
            AllEnrichment = await incidentRepo.getAllEnrichment();
          } catch (error) {
            errorStatus = error.status;
          }
          await queryRunner.rollbackTransaction();
        } catch (err) {
          await queryRunner.rollbackTransaction();
        } finally {
          await queryRunner.release();
        }
        connectionForInsert.close();
      });
    });
  });
});
