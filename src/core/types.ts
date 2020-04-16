import { Hermeticity, hermeticityType } from './hermeticity';
import { Alert, alertType } from './alert';

export interface TypeToEnrichment {
  [hermeticityType]: Hermeticity;
  [alertType]: Alert;
}

export type TypeName = keyof TypeToEnrichment;
