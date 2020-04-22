import { AllEnrichmentResponse, EnrichmentRepo } from '../core/repository';

export async function getEnrichments(enrichmentRepo: EnrichmentRepo): Promise<AllEnrichmentResponse> {
  return enrichmentRepo.getAllEnrichment();
}
