import sinon, { SinonSandbox } from 'sinon';
import { expect } from 'chai';
import logger from '../src/logger';
import { EnrichmentRepo } from '../src/core/repository';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { mppAlert, mppHermeticity } from './config';
import { addEnrichment } from '../src/app/addEnrichment';
import { getEnrichments } from '../src/app/getEnrichment';
import { AppError } from '../src/core/exc';

describe('app', function() {
  let sandbox: SinonSandbox = (null as unknown) as SinonSandbox;
  let repo: EnrichmentRepo;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    // disable logging
    sandbox.stub(logger);

    repo = {} as EnrichmentRepo;
    repo.addHermeticity = sandbox.stub();
    repo.addAlert = sandbox.stub();
    repo.getAllEnrichment = sandbox.stub();
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe('addEnrichment', function() {
    it('should call `addHermeticity` on repo instance when `MPPHermeticity` is passed', async function() {
      await addEnrichment(mppHermeticity, repo);
      expect((repo.addHermeticity as any).calledOnce).to.be.true;
    });
    it(`should pass the hermeticity instance received to the repo's 'addHermeticity' method`, async function() {
      await addEnrichment(mppHermeticity, repo);
      const calledWith = (repo.addHermeticity as any).getCall(0).args[0];
      expect(calledWith).to.be.eq(mppHermeticity);
    });
    it('should call `addAlert` on repo instance when `MPPAlert` is passed', async function() {
      await addEnrichment(mppAlert, repo);
      expect((repo.addAlert as any).calledOnce).to.be.true;
    });
    it(`should pass the alert instance received to the repo's 'addAlert' method`, async function() {
      await addEnrichment(mppAlert, repo);
      const calledWith = (repo.addAlert as any).getCall(0).args[0];
      expect(calledWith).to.be.eq(mppAlert);
    });
    it('should throw `AppError` if passed unknown type of `MPPEnrichment`', async function() {
      try {
        await addEnrichment({ ...mppAlert, type: 'idk' }, repo);
      } catch (e) {
        expect(e instanceof AppError).to.be.true;
        return;
      }
      throw Error('No error thrown');
    });
  });
  describe('getEnrichments', function() {
    it('should call `getAllEnrichments` on repo instance passed', async function() {
      await getEnrichments(repo);
      expect((repo.getAllEnrichment as any).calledOnce).to.be.true;
    });
  });
});
