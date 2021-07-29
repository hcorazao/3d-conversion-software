import { Action } from '@ngrx/store';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { CaseProcessingStep } from '@app/models/enums/case-processing-step';
import { RecentDentalCase } from '@app/models/recent-dental-case.model';
import { CaseAdditionalFileImportError } from '@app/models/enums/case-additional-file-import-error.enum';
import { Patient } from '@app/models/patient.model';
import { StepperJumpsConfiguration } from '@app/models/stepper-jumps-configuration.model';
import { StepperJump } from '@app/models/stepper-jump.model';

export enum BabylonActionType {
  initializeBabylon = '[Babylon] Initialize Babylon',
  folderHandleForCaseFolderUploaded = '[Babylon] Folder Handle For Case Folder Uploaded',
  filesForCaseFolderUploaded = '[Babylon] Files For Case Folder Uploaded',
  prepareAndLoadCase = '[Babylon] Prepare And Load Case',
  loadCase = '[Babylon] Load Case',
  caseInitiallyLoaded = '[Babylon] Case Initially Loaded',
  stoppedLoadingCase = '[Babylon] Stopped Loading Case',
  changeCaseProcessingStep = '[Babylon] Change Case Processing Step',
  changedCaseProcessingStep = '[Babylon] Changed Case Processing Step',
  prepareResultExport = '[Babylon] Prepare Result Export',
  exportResult = '[Babylon] Export Result',
  exportFileToCaseFolderLocation = '[Babylon] Export File To Case Folder Location',
  restartCase = '[Babylon] Restart Case',
  importCasesFromImportFolder = '[Babylon] Import Cases From Import Folder',
  casesImportedFromImportFolder = '[Babylon] Cases Imported From Import Folder',
  errorImportingCasesFromImportFolder = '[Babylon] Error Importing Cases From Import Folder',
  loadRecentDentalCases = '[Babylon] Load Recent Dental Cases',
  loadedRecentDentalCases = '[Babylon] Loaded Recent Dental Cases',
  preparationMarginEntering = '[Babylon] Preparation Margin Entering',
  preparationMarginEntered = '[Babylon] Preparation Margin Entered',
  preparationMarginEditing = '[Babylon] Preparation Margin Editing',
  preparationMarginEdited = '[Babylon] Preparation Margin Edited',
  copyLineActivated = '[Babylon] Copy Line Activated',
  copyLineDeactivated = '[Babylon] Copy Line Deactivated',
  resetScene = '[Babylon] Reset Scene',
  errorLoadingCaseFolder = '[Babylon] Error Loading Case Folder',
  importCaseAdditionalFile = '[Babylon] Import Case Additional File',
  caseAdditionalFileImported = '[Babylon] Case Additional File Imported',
  completeCase = '[Babylon] Complete Case',
  searchPatientDentalCases = '[Babylon] Search Patient Dental Cases',
  babylonDebugCall = '[Babylon] Babylon Debug Call',
  configureUndoRedoButtons = '[Babylon] Configure Undo And Redo Buttons',
  setUndoButtonEnability = '[Babylon] Set Undo Button Enability',
  setRedoButtonEnability = '[Babylon] Set Redo Button Enability',
  undoActionInStep = '[Babylon] Undo Action In Step',
  redoActionInStep = '[Babylon] Redo Action In Step',
  checkPossibleStepperJumps = '[Babylon] Check Possible Stepper Jumps',
  possibleStepperJumpsChecked = '[Babylon] Possible Stepper Jumps Checked',
  jumpToCaseProcessingStepWithTransition = '[Babylon] Jump To Case Processing Step',
  setExportButtonEnability = '[Babylon] Toggling Export button Enable/Disable',
}

export class InitializeBabylon implements Action {
  readonly type = BabylonActionType.initializeBabylon;
  constructor(public payload: { canvasElementId: string }) {}
}

export class FolderHandleForCaseFolderUploaded implements Action {
  readonly type = BabylonActionType.folderHandleForCaseFolderUploaded;
  constructor(public payload: { folderHandle: FileSystemDirectoryHandle }) {}
}

export class FilesForCaseFolderUploaded implements Action {
  readonly type = BabylonActionType.filesForCaseFolderUploaded;
  constructor(public payload: { folderName: string; files: File[]; folderHandle: FileSystemDirectoryHandle }) {}
}

export class PrepareAndLoadCase implements Action {
  readonly type = BabylonActionType.prepareAndLoadCase;
  constructor(public payload: { dentalCaseFolder: DentalCaseFolder; fromImportFolder: boolean }) {}
}

export class LoadCase implements Action {
  readonly type = BabylonActionType.loadCase;
  constructor(public payload: { dentalCaseFolder: DentalCaseFolder; fromImportFolder: boolean }) {}
}

export class CaseInitiallyLoaded implements Action {
  readonly type = BabylonActionType.caseInitiallyLoaded;
}

export class StoppedLoadingCase implements Action {
  readonly type = BabylonActionType.stoppedLoadingCase;
}

export class ChangeCaseProcessingStep implements Action {
  readonly type = BabylonActionType.changeCaseProcessingStep;
  constructor(public payload: { step: CaseProcessingStep }) {}
}

export class ChangedCaseProcessingStep implements Action {
  readonly type = BabylonActionType.changedCaseProcessingStep;
  constructor(public payload: { step: CaseProcessingStep }) {}
}

export class PrepareResultExport implements Action {
  readonly type = BabylonActionType.prepareResultExport;
}

export class ExportResult implements Action {
  readonly type = BabylonActionType.exportResult;
  constructor(public payload: { file: File }) {}
}

export class ExportFileToCaseFolderLocation implements Action {
  readonly type = BabylonActionType.exportFileToCaseFolderLocation;
  constructor(public payload: { file: File }) {}
}

export class RestartCase implements Action {
  readonly type = BabylonActionType.restartCase;
  constructor(public payload: { caseFolderImportComponentVisible: boolean }) {}
}

export class ImportCasesFromImportFolder implements Action {
  readonly type = BabylonActionType.importCasesFromImportFolder;
}

export class CasesImportedFromImportFolder implements Action {
  readonly type = BabylonActionType.casesImportedFromImportFolder;
  constructor(public payload: { dentalCaseFolders: DentalCaseFolder[] }) {}
}

export class ErrorImportingCasesFromImportFolder implements Action {
  readonly type = BabylonActionType.errorImportingCasesFromImportFolder;
}

export class LoadRecentDentalCases implements Action {
  readonly type = BabylonActionType.loadRecentDentalCases;
}

export class LoadedRecentDentalCases implements Action {
  readonly type = BabylonActionType.loadedRecentDentalCases;
  constructor(public payload: { recentDentalCases: RecentDentalCase[] }) {}
}

export class PreparationMarginEntering implements Action {
  readonly type = BabylonActionType.preparationMarginEntering;
}

export class PreparationMarginEntered implements Action {
  readonly type = BabylonActionType.preparationMarginEntered;
}

export class PreparationMarginEditing implements Action {
  readonly type = BabylonActionType.preparationMarginEditing;
}

export class PreparationMarginEdited implements Action {
  readonly type = BabylonActionType.preparationMarginEdited;
}

export class CopyLineActivated implements Action {
  readonly type = BabylonActionType.copyLineActivated;
}

export class CopyLineDeactivated implements Action {
  readonly type = BabylonActionType.copyLineDeactivated;
}

export class ResetScene implements Action {
  readonly type = BabylonActionType.resetScene;
}

export class ErrorLoadingCaseFolder implements Action {
  readonly type = BabylonActionType.errorLoadingCaseFolder;
  constructor(public payload: { dentalCaseFolder: DentalCaseFolder; fromImportFolder: boolean }) {}
}

export class ImportCaseAdditionalFile implements Action {
  readonly type = BabylonActionType.importCaseAdditionalFile;
  constructor(public payload: { fileName: string }) {}
}

export class CaseAdditionalFileImported implements Action {
  readonly type = BabylonActionType.caseAdditionalFileImported;
  constructor(public payload: { fileName: string; file: File; error: CaseAdditionalFileImportError }) {}
}

export class CompleteCase implements Action {
  readonly type = BabylonActionType.completeCase;
}

export class SearchPatientDentalCases implements Action {
  readonly type = BabylonActionType.searchPatientDentalCases;
  constructor(public payload: { patient: Patient }) {}
}

export class BabylonDebugCall implements Action {
  readonly type = BabylonActionType.babylonDebugCall;
}
export class ConfigureUndoRedoButtons implements Action {
  readonly type = BabylonActionType.configureUndoRedoButtons;
  constructor(public payload: { undoCallback: () => void; redoCallback: () => void }) {}
}
export class SetUndoButtonEnability implements Action {
  readonly type = BabylonActionType.setUndoButtonEnability;
  constructor(public payload: { enabled: boolean }) {}
}
export class SetRedoButtonEnability implements Action {
  readonly type = BabylonActionType.setRedoButtonEnability;
  constructor(public payload: { enabled: boolean }) {}
}

export class UndoActionInStep implements Action {
  readonly type = BabylonActionType.undoActionInStep;
}

export class RedoActionInStep implements Action {
  readonly type = BabylonActionType.redoActionInStep;
}

export class CheckPossibleStepperJumps implements Action {
  readonly type = BabylonActionType.checkPossibleStepperJumps;
}

export class PossibleStepperJumpsChecked implements Action {
  readonly type = BabylonActionType.possibleStepperJumpsChecked;
  constructor(public payload: { stepperJumpsConfiguration: StepperJumpsConfiguration }) {}
}

export class JumpToCaseProcessingStepWithTransition implements Action {
  readonly type = BabylonActionType.jumpToCaseProcessingStepWithTransition;
  constructor(public payload: { jump: StepperJump }) {}
}

export class ToggleExportButton implements Action {
  readonly type = BabylonActionType.setExportButtonEnability;
  constructor(public payload: { disabled: boolean }) {}
}

export type BabylonAction =
  | InitializeBabylon
  | FolderHandleForCaseFolderUploaded
  | FilesForCaseFolderUploaded
  | PrepareAndLoadCase
  | LoadCase
  | CaseInitiallyLoaded
  | StoppedLoadingCase
  | ChangeCaseProcessingStep
  | ChangedCaseProcessingStep
  | PrepareResultExport
  | ExportResult
  | ExportFileToCaseFolderLocation
  | RestartCase
  | ImportCasesFromImportFolder
  | CasesImportedFromImportFolder
  | ErrorImportingCasesFromImportFolder
  | LoadRecentDentalCases
  | LoadedRecentDentalCases
  | PreparationMarginEntering
  | PreparationMarginEntered
  | PreparationMarginEditing
  | PreparationMarginEdited
  | CopyLineActivated
  | CopyLineDeactivated
  | ResetScene
  | ErrorLoadingCaseFolder
  | ImportCaseAdditionalFile
  | CaseAdditionalFileImported
  | CompleteCase
  | SearchPatientDentalCases
  | BabylonDebugCall
  | ConfigureUndoRedoButtons
  | SetUndoButtonEnability
  | SetRedoButtonEnability
  | UndoActionInStep
  | RedoActionInStep
  | CheckPossibleStepperJumps
  | PossibleStepperJumpsChecked
  | JumpToCaseProcessingStepWithTransition
  | ToggleExportButton;
