import { MPPAlert, Severity, alertType } from '../src/core/alert';
import { MPPHermeticity, HermeticityStatus, hermeticityType } from '../src/core/hermeticity';
import { getConnection, createConnection, Connection } from 'typeorm';



//export let connection: Connection;

export const alert: MPPAlert = {
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

export const hermeticity: MPPHermeticity = {
  timestamp: '2020-03-25T12:00:00Z',
  origin: 'origin',
  ID: 'ID129',
  type: hermeticityType,
  value: 100,
  beakID: 'beakID',
  status: HermeticityStatus.critical,
  hasAlert: true
};

export const alertWitoutNode = {
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

export const hermeticityWitoutTimestampCreated = {
  origin: 'origin',
  ID: 'ID129',
  type: hermeticityType,
  value: 100,
  beakID: 'beakID',
  status: HermeticityStatus.critical,
  hasAlert: true
};

export const hermeticityWithWeongTimestampCreated = {
  timestamp: '2020223-03-25T12:00:00Z',
  origin: 'origin',
  ID: 'ID129',
  type: hermeticityType,
  value: 100,
  beakID: 'beakID',
  status: HermeticityStatus.critical,
  hasAlert: true
};

export async function deleteFromDB(tableName:string, idToDelete:string): Promise<void>{
    if (idToDelete !='deleteAllTheTable'){
      await getConnection().createQueryBuilder().delete().from(tableName).where('id = :id', { id: idToDelete }).execute();
    }
    else{
      await getConnection().createQueryBuilder().delete().from(tableName).execute();
    }
    
  }