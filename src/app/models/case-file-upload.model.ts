import { CaseFileUploadStatus } from './enums/case-file-upload-status.enum';
import { DentalCaseFolder } from './dental-case-folder.model';

export class CaseFileUpload {
  constructor(public titleTranslationString: string, public fileName: string, public status: CaseFileUploadStatus) {}

  static initiateCaseFileUploadsWithDentalCaseFolder(dentalCaseFolder: DentalCaseFolder): CaseFileUpload[] {
    const result = [];
    if (dentalCaseFolder.files.upperJaw) {
      result.push(
        new CaseFileUpload('notification.upload.upperJawFileTitle', dentalCaseFolder.files.upperJaw.name, CaseFileUploadStatus.IN_PROGRESS)
      );
    }
    if (dentalCaseFolder.files.upperJawSitu) {
      result.push(
        new CaseFileUpload(
          'notification.upload.upperJawSituFileTitle',
          dentalCaseFolder.files.upperJawSitu.name,
          CaseFileUploadStatus.IN_PROGRESS
        )
      );
    }
    if (dentalCaseFolder.files.lowerJaw) {
      result.push(
        new CaseFileUpload('notification.upload.lowerJawFileTitle', dentalCaseFolder.files.lowerJaw.name, CaseFileUploadStatus.IN_PROGRESS)
      );
    }
    if (dentalCaseFolder.files.lowerJawSitu) {
      result.push(
        new CaseFileUpload(
          'notification.upload.lowerJawSituFileTitle',
          dentalCaseFolder.files.lowerJawSitu.name,
          CaseFileUploadStatus.IN_PROGRESS
        )
      );
    }
    result.push(
      new CaseFileUpload(
        'notification.upload.caseInformationFileTitle',
        dentalCaseFolder.dentalCase.name + '.dentalProject',
        CaseFileUploadStatus.FINISHED_WITH_SUCCESS
      )
    );
    return result;
  }
}
