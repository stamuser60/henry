import { MPPEnrichment } from '../core/enrichment';
import { alertType, MPPAlert } from '../core/alert';
import { hermeticityType, MPPHermeticity } from '../core/hermeticity';
import { EnrichmentRepo } from '../core/repository';
import { AppError } from '../core/exc';

//console.log("blabla")

export async function addEnrichment(enrichment: MPPEnrichment, repo: EnrichmentRepo): Promise<void> {
  console.log(enrichment.type);
  switch (enrichment.type) {
    case alertType:
      console.log('im in alert');
      return await repo.addAlert(enrichment as MPPAlert);
    case hermeticityType:
      console.log('im in hermet');
      return await repo.addHermeticity(enrichment as MPPHermeticity);
    default:
      throw new AppError(`type ${enrichment.type} does not exist`, 422);
  }
}
