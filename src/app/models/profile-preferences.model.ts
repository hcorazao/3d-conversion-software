import { Language } from './enums/language.enum';
import { DentalNotation } from '@app/models/enums/jaw.enum';

export class ProfilePreferences {
  importFolder?: any;
  exportFolder?: any;
  language?: Language;
  dentalNotation?: DentalNotation;
}
