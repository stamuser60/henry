import { Enrichment, ProcessedEnrichment } from '../core/dataItem';
import { alertType, ProcessedAlertEnrichment } from '../core/alert';
import { hermeticityType, ProcessedHermeticityEnrichment } from '../core/hermeticity';
import { IncidentRepo } from '../core/repository';
import { AppError } from '../core/exc';
import { ID } from '../core/id';

function processEnrichment(enrichment: Enrichment): ProcessedEnrichment {
  return {
    ...enrichment,
    ID: ID()
  };
}

export async function addEnrichment(enrichment: Enrichment, repo: IncidentRepo): Promise<void> {
  const processedEnrichment = processEnrichment(enrichment);
  switch (processedEnrichment.type) {
    case alertType:
      return await repo.addAlert(processedEnrichment as ProcessedAlertEnrichment);
    case hermeticityType:
      return await repo.addHermeticity(processedEnrichment as ProcessedHermeticityEnrichment);
    default:
      throw new AppError(`type ${enrichment.type} does not exist`, 422);
  }
}
