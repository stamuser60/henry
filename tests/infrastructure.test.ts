require('dotenv/config');
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { invalidStructureAlertReceived, invalidStructureHermeticityReceived, mppAlert, mppHermeticity } from './testConfig';
import { CprLogger } from '@stamscope/jslogger';
import sinon, { SinonSandbox } from 'sinon';
import { expect } from 'chai';
import { Readable, ReadableOptions } from 'stream';
import logger from '../src/logger';
import { ConsumerGroupStream, Message, Producer } from 'kafka-node';
import { KafkaEnrichmentDispatcher } from '../src/infrastructure/kafkaDispatcher';
import { KafkaEnrichmentConsumer } from '../src/infrastructure/kafkaConsumer';
import { Incident } from '../src/core/dataItem';
import { AlertSchema, HermeticitySchema } from '../src/infrastructure/schemaGenerator';
import { Schema, Validator } from 'jsonschema';

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
});
