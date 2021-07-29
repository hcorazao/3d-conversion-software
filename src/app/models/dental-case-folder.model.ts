import { VendorType } from './enums/vendor-type.enum';
import { CaseFileModelSizeUnit } from './enums/case-file-model-size-unit.enum';
import { Patient } from './patient.model';
import { Practice } from './practice.model';
import { CaseFile } from './case-file.model';
import { FileType, getFileTypeByFileName } from './enums/file-type.enum';
import { DentalCase } from './dental-case.model';
import { CaseCompletionStatus } from './enums/case-completion-status.enum';
import { Vector3 } from '@babylonjs/core';

export class DentalCaseFolder {
  patient?: Patient;
  practice?: Practice;
  dentalCase?: DentalCase;
  vendor?: VendorType;
  unit?: CaseFileModelSizeUnit;
  fileType?: FileType;
  files: {
    lowerJaw?: File;
    upperJaw?: File;
    lowerJawSitu?: File;
    upperJawSitu?: File;
    marginFile?: File;
    copylineFile?: File;
  };
  vectorsArrays: {
    marginVectorsArray: Vector3[];
    copylineVectorsArray: Vector3[];
  };
  errorMessage?: string;
  folderHandle: FileSystemDirectoryHandle;
  completionStatus: CaseCompletionStatus;

  // INFO: deprecated
  // tslint:disable-next-line: variable-name
  _caseFiles?: CaseFile[];
  get caseFiles(): CaseFile[] {
    console.warn('caseFiles field in DentalCaseFolder model is deprecated - use files with its fields instead');
    return this._caseFiles;
  }
  set caseFiles(files: CaseFile[]) {
    this._caseFiles = files;
  }

  constructor() {}

  static builder(): DentalCaseFolderBuilder {
    return new DentalCaseFolderBuilder();
  }

  copy(): DentalCaseFolder {
    return Object.assign(new DentalCaseFolder(), {
      ...this,
      files: {
        ...this.files,
      },
      vectorsArrays: {
        ...this.vectorsArrays,
      },
    });
  }
}

class DentalCaseFolderBuilder {
  private dentalCaseFolder: DentalCaseFolder;
  constructor() {
    this.dentalCaseFolder = new DentalCaseFolder();
    this.dentalCaseFolder.files = {};
    this.dentalCaseFolder.caseFiles = [];
  }
  withPatient(patient: Patient): DentalCaseFolderBuilder {
    this.dentalCaseFolder.patient = patient;
    return this;
  }
  withPractice(practice: Practice): DentalCaseFolderBuilder {
    this.dentalCaseFolder.practice = practice;
    return this;
  }
  withDentalCase(dentalCase: DentalCase): DentalCaseFolderBuilder {
    this.dentalCaseFolder.dentalCase = dentalCase;
    return this;
  }
  withVendor(vendor: VendorType): DentalCaseFolderBuilder {
    this.dentalCaseFolder.vendor = vendor;
    return this;
  }
  withUnit(unit: CaseFileModelSizeUnit): DentalCaseFolderBuilder {
    this.dentalCaseFolder.unit = unit;
    return this;
  }
  withFileType(fileType: FileType): DentalCaseFolderBuilder {
    this.dentalCaseFolder.fileType = fileType;
    return this;
  }
  withLowerJawFile(lowerJaw: File | undefined): DentalCaseFolderBuilder {
    this.dentalCaseFolder.files.lowerJaw = lowerJaw;
    this.conditionallyAddCaseFile(lowerJaw);
    return this;
  }
  withUpperJawFile(upperJaw: File | undefined): DentalCaseFolderBuilder {
    this.dentalCaseFolder.files.upperJaw = upperJaw;
    this.conditionallyAddCaseFile(upperJaw);
    return this;
  }
  withLowerJawSituFile(lowerJawSitu: File | undefined): DentalCaseFolderBuilder {
    this.dentalCaseFolder.files.lowerJawSitu = lowerJawSitu;
    this.conditionallyAddCaseFile(lowerJawSitu);
    return this;
  }
  withUpperJawSituFile(upperJawSitu: File | undefined): DentalCaseFolderBuilder {
    this.dentalCaseFolder.files.upperJawSitu = upperJawSitu;
    this.conditionallyAddCaseFile(upperJawSitu);
    return this;
  }
  withCaseCompletionStatus(completionStatus: CaseCompletionStatus): DentalCaseFolderBuilder {
    this.dentalCaseFolder.completionStatus = completionStatus;
    return this;
  }
  withMarginFile(marginFile: File | undefined): DentalCaseFolderBuilder {
    this.dentalCaseFolder.files.marginFile = marginFile;
    return this;
  }
  withCopylineFile(copylineFile: File | undefined): DentalCaseFolderBuilder {
    this.dentalCaseFolder.files.copylineFile = copylineFile;
    return this;
  }
  build(): DentalCaseFolder {
    return this.dentalCaseFolder;
  }

  private conditionallyAddCaseFile(file: File) {
    if (file) {
      const fileId = this.dentalCaseFolder._caseFiles.length;
      const fileType = getFileTypeByFileName(file.name.substring(file.name.lastIndexOf('.') + 1));
      this.dentalCaseFolder._caseFiles.push(new CaseFile(fileId, file, fileType));
    }
  }
}
