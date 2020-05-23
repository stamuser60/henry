import { Enrichment, ProcessedEnrichment } from '../core/dataItem';
import { alertType, ProcessedAlertEnrichment } from '../core/alert';
import { hermeticityType, ProcessedHermeticityEnrichment } from '../core/hermeticity';
import { IncidentRepo } from '../core/repository';
import { AppError } from '../core/exc';
import { ID } from '../core/id';

function processEnrichment(enrichment: Enrichment): ProcessedEnrichment {
  /**
   * Generic processing function that should be ran against every enrichment document
   * to turn it into a `ProcessedEnrichment`
   */
  return {
    ...enrichment,
    ID: ID()
  };
}

export async function addEnrichment(enrichment: Enrichment, repo: IncidentRepo): Promise<void> {
  /**
   * Receives an enrichment object, performs processing on it, and tells the repository to add it,
   * based on the type key in the enrichment.
   */
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
