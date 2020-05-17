
import {MPPEnrichment, Enrichment} from '../src/core/enrichment';
import {AppError, SqlFatalhError, SqlRetryableError} from '../src/core/exc';
import { MPPAlert, Severity, alertType , Alert} from '../src/core/alert';
import { expect } from 'chai';
import { addEnrichment } from '../src/app/addEnrichment';
import { enrichmentRepo } from '../src/infrastructure/sql/enrichmentRepo';
//import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../../utils/test-utils";
import { MPPHermeticity, HermeticityStatus, hermeticityType } from '../src/core/hermeticity';
// TypeormDataLoader.ts
import  DataLoader from "dataloader";
import { Repository, getConnection, createConnection,Connection  } from "typeorm";
import Mocha from 'mocha';
describe('Core', async function() {
  console.log('a')
  let connection: Connection;
  console.log('b')
     // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
    beforeAll(async function(){
      console.log('c')
      console.log("creating test connection");
      connection = await createConnection();
    }); 
    console.log('d')
     // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
    afterAll(() => connection.close());
  describe('Alert', async function() {  
    console.log('e')

    it('should chance string to date in timestampCreated and timestampMPP', 
    async function() {
      console.log('boom')
      const alert: MPPAlert = {
        timestampCreated: '2020-03-25T12:00:00Z',
        timestampMPP: '2020-03-25T12:00:00Z',
        origin: 'origin',
        node: 'node',
        type: alertType,
        severity: Severity.minor,
        ID: 'ID15',
        description: 'description',
        object: 'object',
        application: 'application',
        operator: 'operator'
      };    
      try{
      await enrichmentRepo.addAlert(alert);
      } catch (error)
      {
        console.log(error)
      }
      expect(alert.node= 'node').to.eq('node');      
    });   
  }); 
});
