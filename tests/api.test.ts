require('dotenv/config');
import { enrichmentRepo } from '../src/compositionRoot';
import logger from '../src/logger';
import { Response } from 'superagent';
import sinon, { SinonSandbox } from 'sinon';
import { expect } from 'chai';
import request from 'supertest';
import app, { API_PREFIX_V1 } from '../src/server/server';
import * as core from 'express-serve-static-core';
import { AppError } from '../src/core/exc';

function getToApp(app: core.Express, path: string): Promise<Response> {
  return request(app).get(`${API_PREFIX_V1}${path}`);
}

describe('api', function() {
  let sandbox: SinonSandbox = (null as unknown) as SinonSandbox;
  let stubbedGetAllEnrichments: sinon.SinonStub;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    // disable logging
    sandbox.stub(logger);
    stubbedGetAllEnrichments = sandbox.stub(enrichmentRepo, 'getAllEnrichment');
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe('/swagger', function() {
    it('should return OK status', function() {
      return request(app)
        .get('/swagger')
        .then(function(response) {
          expect(response.status).to.be.oneOf([200, 301]);
        });
    });
  });
  describe('/enrichments', function() {
    it('should call get enrichments on repository', async function() {
      await getToApp(app, '/enrichments');
      expect(stubbedGetAllEnrichments.calledOnce).to.be.true;
    });
    it('should use the status of `AppError` error if occurs', async function() {
      stubbedGetAllEnrichments.throws(new AppError('test msg', 444));
      const response = await getToApp(app, '/enrichments');
      expect(response.status).to.be.eq(444);
    });
    it('should return error 500 if error thrown is not `AppError`', async function() {
      stubbedGetAllEnrichments.throws(new Error('test msg'));
      const response = await getToApp(app, '/enrichments');
      expect(response.status).to.be.eq(500);
    });
  });
});
