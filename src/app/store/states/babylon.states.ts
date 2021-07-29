import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { CaseProcessingStep } from '@app/models/enums/case-processing-step';
import { RecentDentalCase } from '@app/models/recent-dental-case.model';
import { StepperJumpsConfiguration } from '@app/models/stepper-jumps-configuration.model';

export interface BabylonState {
  dentalCaseFolder: DentalCaseFolder;
  caseProcessingStep: CaseProcessingStep;
  previousCaseProcessingStep: CaseProcessingStep;
  caseFolderImportComponentVisible: boolean;
  initialCaseLoading: boolean;
  importingCasesFromImportFolder: boolean;
  errorImportingCasesFromImportFolder: boolean;
  finishedImportingCasesFromImportFolder: boolean;
  importedDentalCaseFolders: DentalCaseFolder[];
  recentDentalCases: RecentDentalCase[];
  preparationMarginEntering: boolean;
  preparationMarginEntered: boolean;
  preparationMarginEdition: boolean;
  preparationMarginEditing: boolean;
  copyLineActivated: boolean;
  undoButtonCallback: () => void;
  redoButtonCallback: () => void;
  undoButtonEnabled: boolean;
  redoButtonEnabled: boolean;
  stepperJumpsConfiguration: StepperJumpsConfiguration;
  isCadAssistantExportDisabled: boolean;
}
