import { ObjectSettings } from './object-settings.model';
import { DentalCaseFolder } from './dental-case-folder.model';
import { Jaw } from './enums/jaw.enum';

export class CaseObjectsSettings {
  lowerJaw: ObjectSettings;
  upperJaw: ObjectSettings;
  lowerJawSitu: ObjectSettings;
  upperJawSitu: ObjectSettings;
  crown: ObjectSettings;

  constructor() {
    this.lowerJaw = new ObjectSettings();
    this.upperJaw = new ObjectSettings();
    this.lowerJawSitu = new ObjectSettings();
    this.upperJawSitu = new ObjectSettings();
    this.crown = new ObjectSettings();
  }

  static createForDentalCaseFolder(dentalCaseFolder: DentalCaseFolder) {
    const caseObjectsSettings = new CaseObjectsSettings();
    caseObjectsSettings.lowerJaw.available = !!dentalCaseFolder.files.lowerJaw;
    caseObjectsSettings.upperJaw.available = !!dentalCaseFolder.files.upperJaw;
    caseObjectsSettings.lowerJawSitu.available = !!dentalCaseFolder.files.lowerJawSitu;
    caseObjectsSettings.upperJawSitu.available = !!dentalCaseFolder.files.upperJawSitu;
    if (dentalCaseFolder.dentalCase && dentalCaseFolder.dentalCase.preparationJaw === Jaw.LOWER) {
      caseObjectsSettings.lowerJaw.opacity = 1;
    } else if (dentalCaseFolder.dentalCase && dentalCaseFolder.dentalCase.preparationJaw === Jaw.UPPER) {
      caseObjectsSettings.upperJaw.opacity = 1;
    }
    return caseObjectsSettings;
  }

  static createByUpdating(base: CaseObjectsSettings, update: CaseObjectsSettings): CaseObjectsSettings {
    const result = new CaseObjectsSettings();
    result.lowerJaw = ObjectSettings.createByUpdating(base?.lowerJaw, update.lowerJaw);
    result.upperJaw = ObjectSettings.createByUpdating(base?.upperJaw, update.upperJaw);
    result.lowerJawSitu = ObjectSettings.createByUpdating(base?.lowerJawSitu, update.lowerJawSitu);
    result.upperJawSitu = ObjectSettings.createByUpdating(base?.upperJawSitu, update.upperJawSitu);
    result.crown = ObjectSettings.createByUpdating(base?.crown, update.crown);
    return result;
  }
}
