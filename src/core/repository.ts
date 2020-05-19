import { ProcessedHermeticityEnrichment } from './hermeticity';
import { ProcessedAlertEnrichment } from './alert';
import { TypeNameIncident, TypeToIncident } from './types';

export type AllEnrichmentResponse = {
  [P in TypeNameIncident]: TypeToIncident[P][];
};

export interface IncidentRepo {
  addHermeticity(hermeticity: ProcessedHermeticityEnrichment): Promise<void>;
  addAlert(alert: ProcessedAlertEnrichment): Promise<void>;
  getAllEnrichment(): Promise<AllEnrichmentResponse>;
}

// TODO: the functions that add enrichments to the repository should retry until they succeed
