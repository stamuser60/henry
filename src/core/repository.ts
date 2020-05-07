import { MPPHermeticity } from './hermeticity';
import { MPPAlert } from './alert';
import { TypeName, TypeToEnrichment } from './types';

export type AllEnrichmentResponse = {
  [P in TypeName]: TypeToEnrichment[P][];
};

export interface EnrichmentRepo {
  addHermeticity(hermeticity: MPPHermeticity): Promise<void>;
  addAlert(alert: MPPAlert): Promise<void>;
  getAllEnrichment(): Promise<AllEnrichmentResponse>;
}

// TODO: the functions that add enrichments to the repository should retry until they succeed
