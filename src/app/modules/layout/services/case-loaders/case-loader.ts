import { DentalCaseFolder } from '@app/models/dental-case-folder.model';

export interface CaseLoader {
  findCaseFile(files: File[]): File;
  parseCaseFile(caseFile: File): Promise<DentalCaseFolder>;
  prepareFullCaseFolder(patientDentalCase: DentalCaseFolder, caseFile: File, files: File[]): Promise<DentalCaseFolder>;
}
