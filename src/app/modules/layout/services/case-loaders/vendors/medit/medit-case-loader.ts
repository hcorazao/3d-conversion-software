import { CaseLoader } from '../../case-loader';
import { Patient } from '@app/models/patient.model';
import { Injectable } from '@angular/core';
import { CaseXmlParserService } from '../../case-xml-parser.service';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { VendorType } from '@app/models/enums/vendor-type.enum';
import { FileType } from '@app/models/enums/file-type.enum';
import { CaseFileModelSizeUnit } from '@app/models/enums/case-file-model-size-unit.enum';
import { getJawByToothNumber } from '@app/models/enums/jaw.enum';
import { DentalCase } from '@app/models/dental-case.model';
import { Practice } from '@app/models/practice.model';

const CASE_FILE_SUFFIX = '.dentalproject';
const MEDIT_LOWER_JAW_MIDDLE_FILE_NAME = '-lowerjaw';
const MEDIT_UPPER_JAW_MIDDLE_FILE_NAME = '-upperjaw';
const MEDIT_LOWER_JAW_SITU_MIDDLE_FILE_NAME = '-lowerjaw-situ';
const MEDIT_UPPER_JAW_SITU_MIDDLE_FILE_NAME = '-upperjaw-situ';
const PREPARATION_RECONSTRUCTION_TYPES = ['AnatomicCrown', 'AnatomicWaxup', 'AnatomicPontic'];

@Injectable({
  providedIn: 'root',
})
export class MeditCaseLoader implements CaseLoader {
  constructor(private caseXmlParserService: CaseXmlParserService) {}

  public findCaseFile(files: File[]): File {
    const caseFile = files.find((file) => file.name.toLowerCase().endsWith(CASE_FILE_SUFFIX));
    if (!caseFile) {
      throw new Error('no case file found');
    } else {
      return caseFile;
    }
  }

  public async parseCaseFile(caseFile: File): Promise<DentalCaseFolder> {
    const xmlContent = await caseFile.text();
    const caseName = caseFile.name.substring(0, caseFile.name.toLowerCase().indexOf(CASE_FILE_SUFFIX));
    return this.caseXmlParserService.parse(xmlContent, caseName, this.xmlJsonToCaseFolder.bind(this));
  }

  private xmlJsonToCaseFolder(xmlJson, caseName): DentalCaseFolder {
    const patient = new Patient();
    patient.id = xmlJson.Treatment.Patient.PatientId;
    patient.name = xmlJson.Treatment.Patient.PatientName;
    const practice = new Practice();
    practice.id = xmlJson.Treatment.Practice.PracticeId;
    practice.name = xmlJson.Treatment.Practice.PracticeName;
    const dentalCase = new DentalCase();
    dentalCase.name = caseName;
    dentalCase.date = new Date(xmlJson.Treatment.DateTime);
    const teeth = xmlJson.Treatment.Teeth.Tooth;
    if (Array.isArray(teeth)) {
      teeth.forEach((tooth: any) => {
        if (PREPARATION_RECONSTRUCTION_TYPES.indexOf(tooth.ReconstructionType) !== -1) {
          this.updateDentalCaseWithTooth(dentalCase, tooth);
        }
      });
    } else if (teeth !== undefined && teeth instanceof Object) {
      const tooth = teeth;
      if (PREPARATION_RECONSTRUCTION_TYPES.indexOf(tooth.ReconstructionType) !== -1) {
        this.updateDentalCaseWithTooth(dentalCase, tooth);
      }
    }
    const dentalCaseFolder = new DentalCaseFolder();
    dentalCaseFolder.patient = patient;
    dentalCaseFolder.practice = practice;
    dentalCaseFolder.dentalCase = dentalCase;
    return dentalCaseFolder;
  }

  private updateDentalCaseWithTooth(dentalCase: DentalCase, tooth: any) {
    dentalCase.preparationToothNumber = tooth.Number;
    dentalCase.preparationJaw = getJawByToothNumber(tooth.Number);
    dentalCase.indication = tooth.PreparationType;
    dentalCase.material = tooth.MaterialName;
    dentalCase.shade = tooth.Color;
  }

  public async prepareFullCaseFolder(dentalCaseFolder: DentalCaseFolder, caseFile: File, files: File[]): Promise<DentalCaseFolder> {
    const caseName = caseFile.name.substring(0, caseFile.name.toLowerCase().indexOf(CASE_FILE_SUFFIX));
    const filesMatrix = await this.createFileTypeToModelTypeFilesMatrixFromVendorValidFiles(files, caseName);
    const resultFileType = this.decideOnFileType(filesMatrix);

    const prepMarginFilename = `${dentalCaseFolder.dentalCase.name}-${dentalCaseFolder.dentalCase.preparationToothNumber}-Margin.xyz`;
    const copylineFilename = `${dentalCaseFolder.dentalCase.name}-${dentalCaseFolder.dentalCase.preparationToothNumber}-Copyline.xyz`;
    const marginFile = files.filter((file) => file.name === prepMarginFilename)[0];
    const copylineFile = files.filter((file) => file.name === copylineFilename)[0];
    return this.prepareResult({
      dentalCaseFolder,
      resultFileType,
      filesMatrix,
      marginFile,
      copylineFile,
    });
  }

  private async createFileTypeToModelTypeFilesMatrixFromVendorValidFiles(files, caseName) {
    const filesMatrix = { [FileType.OBJ]: {}, [FileType.STL]: {}, [FileType.PLY]: {} };
    for (const file of files) {
      if (!file.name.startsWith(caseName) || file.name.toLowerCase().endsWith(CASE_FILE_SUFFIX)) {
        continue;
      }
      const fileType = file.name.substring(file.name.lastIndexOf('.') + 1);
      const modelType = file.name.substring(caseName.length, file.name.lastIndexOf('.'));
      if (
        [FileType.OBJ, FileType.STL, FileType.PLY].indexOf(fileType) === -1 ||
        [
          MEDIT_LOWER_JAW_MIDDLE_FILE_NAME,
          MEDIT_UPPER_JAW_MIDDLE_FILE_NAME,
          MEDIT_LOWER_JAW_SITU_MIDDLE_FILE_NAME,
          MEDIT_UPPER_JAW_SITU_MIDDLE_FILE_NAME,
        ].indexOf(modelType) === -1
      ) {
        continue;
      }
      filesMatrix[fileType][modelType] = file;
    }
    return filesMatrix;
  }

  private decideOnFileType(filesMatrix) {
    const allFiles = [
      filesMatrix[FileType.OBJ][MEDIT_LOWER_JAW_MIDDLE_FILE_NAME],
      filesMatrix[FileType.STL][MEDIT_LOWER_JAW_MIDDLE_FILE_NAME],
      filesMatrix[FileType.PLY][MEDIT_LOWER_JAW_MIDDLE_FILE_NAME],
      filesMatrix[FileType.OBJ][MEDIT_UPPER_JAW_MIDDLE_FILE_NAME],
      filesMatrix[FileType.STL][MEDIT_UPPER_JAW_MIDDLE_FILE_NAME],
      filesMatrix[FileType.PLY][MEDIT_UPPER_JAW_MIDDLE_FILE_NAME],
      filesMatrix[FileType.OBJ][MEDIT_LOWER_JAW_SITU_MIDDLE_FILE_NAME],
      filesMatrix[FileType.STL][MEDIT_LOWER_JAW_SITU_MIDDLE_FILE_NAME],
      filesMatrix[FileType.PLY][MEDIT_LOWER_JAW_SITU_MIDDLE_FILE_NAME],
      filesMatrix[FileType.OBJ][MEDIT_UPPER_JAW_SITU_MIDDLE_FILE_NAME],
      filesMatrix[FileType.STL][MEDIT_UPPER_JAW_SITU_MIDDLE_FILE_NAME],
      filesMatrix[FileType.PLY][MEDIT_UPPER_JAW_SITU_MIDDLE_FILE_NAME],
    ];
    return this.getLatestFile(allFiles);
  }

  private getLatestFile(filesArray) {
    const filesListWithoutUndefined = filesArray.filter((file) => file !== undefined);
    const fileWithLatestTimestamp = filesListWithoutUndefined.reduce((previousValue, currentValue) => {
      if (previousValue.lastModified !== undefined || currentValue.lastModified !== undefined) {
        return previousValue.lastModified > currentValue.lastModified ? previousValue : currentValue;
      }
    });
    return fileWithLatestTimestamp.name.split('.').pop();
  }

  private prepareResult(raw: {
    dentalCaseFolder: DentalCaseFolder;
    resultFileType: FileType;
    filesMatrix;
    marginFile: File;
    copylineFile: File;
  }): DentalCaseFolder {
    const dentalCaseFolder = DentalCaseFolder.builder()
      .withPatient(raw.dentalCaseFolder.patient)
      .withPractice(raw.dentalCaseFolder.practice)
      .withDentalCase(raw.dentalCaseFolder.dentalCase)
      .withVendor(VendorType.MEDIT)
      .withUnit(CaseFileModelSizeUnit.ONE_MM)
      .withFileType(raw.resultFileType)
      .withLowerJawFile(raw.filesMatrix[raw.resultFileType][MEDIT_LOWER_JAW_MIDDLE_FILE_NAME])
      .withUpperJawFile(raw.filesMatrix[raw.resultFileType][MEDIT_UPPER_JAW_MIDDLE_FILE_NAME])
      .withLowerJawSituFile(raw.filesMatrix[raw.resultFileType][MEDIT_LOWER_JAW_SITU_MIDDLE_FILE_NAME])
      .withUpperJawSituFile(raw.filesMatrix[raw.resultFileType][MEDIT_UPPER_JAW_SITU_MIDDLE_FILE_NAME])
      .withMarginFile(raw.marginFile)
      .withCopylineFile(raw.copylineFile)
      .build();
    return dentalCaseFolder;
  }
}
