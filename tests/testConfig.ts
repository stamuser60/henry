import { AlertEnrichment, Severity } from '../src/core/alert';
import { HermeticityEnrichment, HermeticityStatus } from '../src/core/hermeticity';

const timestamp = '2020-03-25T12:24:23.319Z';
const futureTimestamp = '2099-03-26T12:24:23.319Z';
export const mppAlert: AlertEnrichment = {
  origin: 'asd',
  timestamp: '2019-01-28T08:14:00.000Z',
  severity: Severity.critical,
  operator: 'asd',
  object: 'sdf',
  node: 'asd',
  description: 'asd',
  application: 'asd',
  type: 'alert'
};
export const mppHermeticity: HermeticityEnrichment = {
  timestamp: '2019-01-28T08:14:00.000Z',
  origin: 'sd',
  value: 23,
  status: HermeticityStatus.critical,
  hasAlert: false,
  beakID: 'sdf',
  type: 'hermeticity'
};

export const invalidStructureAlertReceived = {
  application: 'asd',
  description: 'asd',
  node: 'as',
  object: 'asd',
  operator: 'asd',
  origin: 'asd',
  timestampsd: '2019-01-27T08:14:00.000Z'
};
export const invalidStructureHermeticityReceived = {
  timestampfds: '2019-01-27T08:14:00.000Z',
  origin: 'df',
  beakID: 'asd',
  hasAlert: false,
  status: 2
};
