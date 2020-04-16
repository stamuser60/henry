import { MPPEnrichment } from '../core/enrichment';
import { alertType, MPPAlert } from '../core/alert';
import { hermeticityType, MPPHermeticity } from '../core/hermeticity';
import { EnrichmentRepo } from '../core/repository';

export async function processEnrichment(enrichment: MPPEnrichment, repo: EnrichmentRepo): Promise<void> {
  switch (enrichment.type) {
    case alertType:
      return await repo.addAlert(enrichment as MPPAlert);
    case hermeticityType:
      return await repo.addHermeticity(enrichment as MPPHermeticity);
    default:
      throw Error('no type found for the enrichment');
  }
}
