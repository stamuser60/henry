import { AllEnrichmentResponse, IncidentRepo } from '../core/repository';

export async function getEnrichments(enrichmentRepo: IncidentRepo): Promise<AllEnrichmentResponse> {
  return enrichmentRepo.getAllEnrichment();
}
