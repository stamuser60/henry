require('dotenv/config');
import { alertConsumer, infoConsumer, incidentRepo } from '../src/compositionRoot';
import logger from '../src/logger';
import { Response } from 'superagent';
import sinon, { SinonSandbox } from 'sinon';
import { expect } from 'chai';
import request from 'supertest';
import app, { API_PREFIX_V1 } from '../src/server/server';
import * as core from 'express-serve-static-core';
import { AppError } from '../src/core/exc';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { mppAlert, mppHermeticity } from './testConfig';
import { preValidateAlert, preValidateInfo } from '../src/api/preValidate';

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
    stubbedGetAllEnrichments = sandbox.stub(incidentRepo, 'getAllEnrichment');
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
  describe('preValidate', function() {
    describe('preValidateInfo', function() {
      it('should turn object into list of one object if passed single object', function() {
        const result = preValidateInfo(mppHermeticity);
        expect(Array.isArray(result)).to.be.true;
      });
    });
    describe('preValidateAlert', function() {
      it('should turn object into list of one object if passed single object', function() {
        const result = preValidateAlert(mppAlert);
        expect(Array.isArray(result)).to.be.true;
      });
      it('should add key with name `type` and value `alert` to each object passed in', function() {
        const singleObjectResult = preValidateAlert(mppAlert);
        expect((singleObjectResult[0] as any).type).to.be.eq('alert');
        const multipleObjectsResult = preValidateAlert(mppAlert);
        for (const obj of multipleObjectsResult) {
          expect((obj as any).type).to.be.eq('alert');
        }
      });
    });
  });
  // describe('kafka', function() {
  //   let stubbedInfoConsumer: any;
  //   let stubbedAlertConsumer: any;
  //   let stubbedRepo: any;
  //   beforeEach(function() {
  //     stubbedInfoConsumer = sandbox.stub(infoConsumer);
  //     stubbedAlertConsumer = sandbox.stub(alertConsumer);
  //     stubbedRepo = sandbox.stub(incidentRepo);
  //   });
  //   it('should pass', function() {
  //
  //   });
  // });
});

// TODO: add tests for the kafka part in the api folder
