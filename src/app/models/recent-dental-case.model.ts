import { Patient } from './patient.model';
import { DentalCase } from './dental-case.model';
import { CaseCompletionStatus } from './enums/case-completion-status.enum';

export class RecentDentalCase {
  patient?: Patient;
  dentalCase?: DentalCase;
  openingDate?: Date;
  availableInImportFolder?: boolean;
  completionStatus?: CaseCompletionStatus;
  errorMessage?: string | null;

  static builder(): RecentDentalCaseBuilder {
    return new RecentDentalCaseBuilder();
  }
}

export class RecentDentalCaseBuilder {
  recentDentalCase: RecentDentalCase;
  constructor() {
    this.recentDentalCase = new RecentDentalCase();
  }

  withPatient(patient: Patient): RecentDentalCaseBuilder {
    this.recentDentalCase.patient = patient;
    return this;
  }
  withDentalCase(dentalCase: DentalCase): RecentDentalCaseBuilder {
    this.recentDentalCase.dentalCase = dentalCase;
    return this;
  }
  withOpeningDate(openingDate: Date): RecentDentalCaseBuilder {
    this.recentDentalCase.openingDate = openingDate;
    return this;
  }
  withAvailableInImportFolder(availableInImportFolder: boolean): RecentDentalCaseBuilder {
    this.recentDentalCase.availableInImportFolder = availableInImportFolder;
    return this;
  }
  withCaseCompletionStatus(completionStatus: CaseCompletionStatus): RecentDentalCaseBuilder {
    this.recentDentalCase.completionStatus = completionStatus;
    return this;
  }
  withErrorMessage(errorMessage: string | null): RecentDentalCaseBuilder {
    this.recentDentalCase.errorMessage = errorMessage;
    return this;
  }

  build(): RecentDentalCase {
    return this.recentDentalCase;
  }
}
