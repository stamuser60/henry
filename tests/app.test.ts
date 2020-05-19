require('dotenv/config');
import sinon, { SinonSandbox } from 'sinon';
import { expect } from 'chai';
import logger from '../src/logger';
import { IncidentRepo } from '../src/core/repository';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { mppAlert, mppHermeticity } from './testConfig';
import { addEnrichment } from '../src/app/addEnrichment';
import { getEnrichments } from '../src/app/getEnrichment';
import { AppError } from '../src/core/exc';

describe('app', function() {
  let sandbox: SinonSandbox = (null as unknown) as SinonSandbox;
  let repo: IncidentRepo;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    // disable logging
    sandbox.stub(logger);

    repo = {} as IncidentRepo;
    repo.addHermeticity = sandbox.stub();
    repo.addAlert = sandbox.stub();
    repo.getAllEnrichment = sandbox.stub();
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe('addEnrichment', function() {
    it('should call `addHermeticity` on repo instance when `ProcessedHermeticityEnrichment` is passed', async function() {
      await addEnrichment(mppHermeticity, repo);
      expect((repo.addHermeticity as any).calledOnce).to.be.true;
    });
    it(`should pass the hermeticity instance without changing existing fields`, async function() {
      await addEnrichment(mppHermeticity, repo);
      const calledWith = (repo.addHermeticity as any).getCall(0).args[0];
      expect(calledWith).to.deep.include({ ...calledWith, ...mppHermeticity });
    });
    it('should add ID to hermeticity passed', async function() {
      await addEnrichment(mppHermeticity, repo);
      const hermeticityCalledWith = (repo.addHermeticity as any).getCall(0).args[0];
      expect(typeof hermeticityCalledWith.ID).to.be.eq('string');
    });
    it('should add ID to alert passed', async function() {
      await addEnrichment(mppAlert, repo);
      const alertCalledWith = (repo.addAlert as any).getCall(0).args[0];
      expect(typeof alertCalledWith.ID).to.be.eq('string');
    });
    it('should call `addAlert` on repo instance when `AlertEnrichment` is passed', async function() {
      await addEnrichment(mppAlert, repo);
      expect((repo.addAlert as any).calledOnce).to.be.true;
    });
    it(`should pass the alert instance received to the repo's 'addAlert' method`, async function() {
      await addEnrichment(mppAlert, repo);
      const calledWith = (repo.addAlert as any).getCall(0).args[0];
      expect(calledWith).to.deep.include({ ...calledWith, ...mppAlert });
    });
    it('should throw `AppError` if passed unknown type of `Enrichment`', async function() {
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
