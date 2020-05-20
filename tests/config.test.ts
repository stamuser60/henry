require('dotenv/config');
import sinon, { SinonSandbox } from 'sinon';
import { expect } from 'chai';
import logger from '../src/logger';
import { getEnv } from '../src/config';

describe('config', function() {
  let sandbox: SinonSandbox = (null as unknown) as SinonSandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    // disable logging
    sandbox.stub(logger);
  });
  afterEach(function() {
    sandbox.restore();
  });
  describe('getEnv', function() {
    it('should return proper environment variable', function() {
      process.env['TEST_ENV'] = 'asd';
      expect(getEnv('TEST_ENV')).to.be.eq(process.env['TEST_ENV']);
    });
    it('should return default value if specified', function() {
      expect(getEnv('SOMETHING_WEIRD', 'test')).to.be.eq('test');
    });
    it('should throw error if no environment variable is found and no default value specified', function() {
      expect(() => getEnv('SOMETHING_WEIRD')).to.throw('Please define SOMETHING_WEIRD');
    });
  });
});
