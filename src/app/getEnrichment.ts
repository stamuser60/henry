import { AllEnrichmentResponse, IncidentRepo } from '../core/repository';

export async function getEnrichments(enrichmentRepo: IncidentRepo): Promise<AllEnrichmentResponse> {
  /**
   * Returns all current open incidents.
   */
  return enrichmentRepo.getAllEnrichment();
}
