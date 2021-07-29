import { CaseCompletionStatus } from '@app/models/enums/case-completion-status.enum';

export class DentalCaseSimple {
  patientName: string;
  patientId: string;
  caseName: string;
  caseDate: Date;
  caseFormattedDate: string;
  availableInImportFolder: boolean;
  errorMessage: string;
  completionStatus: CaseCompletionStatus;
  thumbnailSrc: string;

  constructor() {}

  static builder(): DentalCaseSimpleBuilder {
    return new DentalCaseSimpleBuilder();
  }
}

export class DentalCaseSimpleBuilder {
  dentalCaseSimple: DentalCaseSimple;

  constructor() {
    this.dentalCaseSimple = new DentalCaseSimple();
  }

  withPatientName(patientName: string): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.patientName = patientName;
    return this;
  }
  withPatientId(patientId: string): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.patientId = patientId;
    return this;
  }
  withCaseName(caseName: string): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.caseName = caseName;
    return this;
  }
  withCaseDate(caseDate: Date): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.caseDate = caseDate;
    return this;
  }
  withCaseFormattedDate(caseFormattedDate: string): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.caseFormattedDate = caseFormattedDate;
    return this;
  }
  withAvailableInImportFolder(availableInImportFolder: boolean): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.availableInImportFolder = availableInImportFolder;
    return this;
  }
  withErrorMessage(errorMessage: string): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.errorMessage = errorMessage;
    return this;
  }
  withCompletionStatus(completionStatus: CaseCompletionStatus): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.completionStatus = completionStatus;
    return this;
  }
  withThumbnailSrc(thumbnailSrc: string): DentalCaseSimpleBuilder {
    this.dentalCaseSimple.thumbnailSrc = thumbnailSrc;
    return this;
  }
  build(): DentalCaseSimple {
    return this.dentalCaseSimple;
  }
}
