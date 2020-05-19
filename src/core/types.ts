import { ProcessedHermeticityEnrichment, hermeticityType, HermeticityIncident } from './hermeticity';
import { AlertIncident, alertType, ProcessedAlertEnrichment } from './alert';

export interface TypeToEnrichment {
  [hermeticityType]: ProcessedHermeticityEnrichment;
  [alertType]: ProcessedAlertEnrichment;
}

export interface TypeToIncident {
  [hermeticityType]: HermeticityIncident;
  [alertType]: AlertIncident;
}

export type TypeNameEnrichment = keyof TypeToEnrichment;
export type TypeNameIncident = keyof TypeToIncident;
