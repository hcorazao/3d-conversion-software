import { BabylonAction, BabylonActionType } from '../actions/babylon.actions';
import { BabylonState } from '@app/store/states';
import { CaseProcessingMainStep, CaseProcessingStep, getCaseProcessingMainStepForStepValue } from '@app/models/enums/case-processing-step';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { CaseCompletionStatus } from '@app/models/enums/case-completion-status.enum';
import { RecentDentalCase } from '@app/models/recent-dental-case.model';
import { StepperJumpsConfiguration } from '@app/models/stepper-jumps-configuration.model';

export const initialState: BabylonState = {
  dentalCaseFolder: null,
  caseProcessingStep: CaseProcessingStep.IMPORT,
  previousCaseProcessingStep: null,
  caseFolderImportComponentVisible: true,
  initialCaseLoading: false,
  importingCasesFromImportFolder: false,
  errorImportingCasesFromImportFolder: false,
  finishedImportingCasesFromImportFolder: false,
  importedDentalCaseFolders: [],
  recentDentalCases: [],
  preparationMarginEntering: false,
  preparationMarginEntered: false,
  preparationMarginEdition: false,
  preparationMarginEditing: false,
  copyLineActivated: false,
  undoButtonCallback: undefined,
  redoButtonCallback: undefined,
  undoButtonEnabled: false,
  redoButtonEnabled: false,
  stepperJumpsConfiguration: StepperJumpsConfiguration.createDefault(),
  isCadAssistantExportDisabled: false,
};

export function reducer(previousState = initialState, action: BabylonAction): BabylonState {
  switch (action.type) {
    case BabylonActionType.loadCase: {
      const currentDentalCaseName = action.payload.dentalCaseFolder?.dentalCase?.name;
      const importedDentalCaseFolders = updateDentalCaseCompletionStatus(
        previousState.importedDentalCaseFolders,
        currentDentalCaseName,
        CaseCompletionStatus.IN_PROGRESS
      );
      return {
        ...previousState,
        dentalCaseFolder: action.payload.dentalCaseFolder,
        initialCaseLoading: true,
        preparationMarginEntered: false,
        preparationMarginEdition: false,
        preparationMarginEditing: false,
        caseFolderImportComponentVisible: true,
        importedDentalCaseFolders,
      };
    }
    case BabylonActionType.caseInitiallyLoaded:
      return {
        ...previousState,
        caseFolderImportComponentVisible: false,
        initialCaseLoading: false,
      };
    case BabylonActionType.changedCaseProcessingStep: {
      const newState = {
        ...previousState,
        previousCaseProcessingStep: previousState.caseProcessingStep,
        caseProcessingStep: action.payload.step,
      };
      const stepChanged = previousState.previousCaseProcessingStep !== newState.caseProcessingStep;
      if (stepChanged && getCaseProcessingMainStepForStepValue(newState.caseProcessingStep) !== CaseProcessingMainStep.PREPARATION_MARGIN) {
        newState.preparationMarginEdition = false;
        newState.preparationMarginEditing = false;
      }
      if (
        newState.caseProcessingStep === CaseProcessingStep.PREPARATION_MARGIN__INSERTION &&
        previousState.caseProcessingStep > action.payload.step
      ) {
        newState.preparationMarginEntered = false;
      }
      if (newState.caseProcessingStep === CaseProcessingStep.IMPORT) {
        newState.caseFolderImportComponentVisible = true;
        newState.dentalCaseFolder = null;
        newState.previousCaseProcessingStep = null;
        newState.initialCaseLoading = false;
        newState.preparationMarginEntered = false;
        newState.preparationMarginEdition = false;
        newState.preparationMarginEditing = false;
        newState.copyLineActivated = false;
        newState.undoButtonCallback = undefined;
        newState.redoButtonCallback = undefined;
        newState.undoButtonEnabled = false;
        newState.redoButtonEnabled = false;
        newState.stepperJumpsConfiguration = StepperJumpsConfiguration.createDefault();
      }
      return newState;
    }
    case BabylonActionType.restartCase:
      return {
        ...previousState,
        caseProcessingStep: CaseProcessingStep.IMPORT,
        previousCaseProcessingStep: null,
        dentalCaseFolder: null,
        caseFolderImportComponentVisible: true,
        initialCaseLoading: false,
        preparationMarginEntered: false,
        preparationMarginEdition: false,
        preparationMarginEditing: false,
        copyLineActivated: false,
        undoButtonCallback: undefined,
        redoButtonCallback: undefined,
        undoButtonEnabled: false,
        redoButtonEnabled: false,
        stepperJumpsConfiguration: StepperJumpsConfiguration.createDefault(),
      };
    case BabylonActionType.importCasesFromImportFolder:
      return {
        ...previousState,
        importingCasesFromImportFolder: true,
      };
    case BabylonActionType.casesImportedFromImportFolder:
      const dentalCaseFolders = updateDentalCaseFoldersWithStatusesFromRecentDentalCases(
        action.payload.dentalCaseFolders,
        previousState.recentDentalCases
      );
      return {
        ...previousState,
        importingCasesFromImportFolder: false,
        finishedImportingCasesFromImportFolder: true,
        importedDentalCaseFolders: dentalCaseFolders,
      };
    case BabylonActionType.errorImportingCasesFromImportFolder:
      return {
        ...previousState,
        errorImportingCasesFromImportFolder: true,
        finishedImportingCasesFromImportFolder: true,
        importingCasesFromImportFolder: false,
        importedDentalCaseFolders: [],
      };
    case BabylonActionType.loadedRecentDentalCases:
      return {
        ...previousState,
        recentDentalCases: action.payload.recentDentalCases,
      };
    case BabylonActionType.preparationMarginEntering:
      return {
        ...previousState,
        preparationMarginEntering: true,
      };
    case BabylonActionType.preparationMarginEntered:
      return {
        ...previousState,
        preparationMarginEntering: false,
        preparationMarginEntered: true,
        preparationMarginEdition: true,
      };
    case BabylonActionType.preparationMarginEditing:
      return {
        ...previousState,
        preparationMarginEditing: true,
      };
    case BabylonActionType.preparationMarginEdited:
      return {
        ...previousState,
        preparationMarginEditing: false,
      };
    case BabylonActionType.copyLineActivated:
      return {
        ...previousState,
        copyLineActivated: true,
      };
    case BabylonActionType.copyLineDeactivated:
      return {
        ...previousState,
        copyLineActivated: false,
      };
    case BabylonActionType.errorLoadingCaseFolder:
      const updatedImportedDentalCaseFolders = previousState.importedDentalCaseFolders.map((dentalCaseFolder) => {
        if (dentalCaseFolder.dentalCase?.name === action.payload.dentalCaseFolder.dentalCase?.name) {
          return {
            ...dentalCaseFolder,
            errorMessage: action.payload.dentalCaseFolder.errorMessage,
          } as DentalCaseFolder;
        } else {
          return dentalCaseFolder;
        }
      });
      return {
        ...previousState,
        importedDentalCaseFolders: updatedImportedDentalCaseFolders,
      };
    case BabylonActionType.completeCase: {
      const currentDentalCaseName = previousState.dentalCaseFolder.dentalCase.name;
      const importedDentalCaseFolders = updateDentalCaseCompletionStatus(
        previousState.importedDentalCaseFolders,
        currentDentalCaseName,
        CaseCompletionStatus.COMPLETED
      );
      return {
        ...previousState,
        importedDentalCaseFolders,
        dentalCaseFolder: Object.assign(new DentalCaseFolder(), previousState.dentalCaseFolder, {
          completionStatus: CaseCompletionStatus.COMPLETED,
        }),
      };
    }
    case BabylonActionType.configureUndoRedoButtons: {
      return {
        ...previousState,
        undoButtonCallback: action.payload.undoCallback,
        redoButtonCallback: action.payload.redoCallback,
      };
    }
    case BabylonActionType.setUndoButtonEnability: {
      return {
        ...previousState,
        undoButtonEnabled: action.payload.enabled,
      };
    }
    case BabylonActionType.setRedoButtonEnability: {
      return {
        ...previousState,
        redoButtonEnabled: action.payload.enabled,
      };
    }
    case BabylonActionType.possibleStepperJumpsChecked: {
      return {
        ...previousState,
        stepperJumpsConfiguration: StepperJumpsConfiguration.createByUpdating(
          previousState.stepperJumpsConfiguration,
          action.payload.stepperJumpsConfiguration
        ),
      };
    }
    case BabylonActionType.setExportButtonEnability: {
      return {
        ...previousState,
        isCadAssistantExportDisabled: action.payload.disabled,
      };
    }
    default:
      return previousState;
  }
}

function updateDentalCaseCompletionStatus(
  dentalCaseFolders: DentalCaseFolder[],
  dentalCaseName: string,
  completionStatus: CaseCompletionStatus
) {
  if (dentalCaseFolders) {
    return dentalCaseFolders.map((dentalCaseFolder) => {
      if (dentalCaseName === dentalCaseFolder.dentalCase.name) {
        return Object.assign(new DentalCaseFolder(), dentalCaseFolder, { completionStatus });
      } else {
        return dentalCaseFolder;
      }
    });
  } else {
    return dentalCaseFolders;
  }
}

function updateDentalCaseFoldersWithStatusesFromRecentDentalCases(
  dentalCaseFolders: DentalCaseFolder[],
  recentDentalCases: RecentDentalCase[]
) {
  if (!recentDentalCases) {
    return dentalCaseFolders;
  }
  const updatedDentalCaseFolders = [];
  const inProgressDentalCasesNames = recentDentalCases.map((dentalCase) => dentalCase.dentalCase.name);
  const completedDentalCasesNames = recentDentalCases
    .filter((dentalCase) => dentalCase.completionStatus === CaseCompletionStatus.COMPLETED)
    .map((dentalCase) => dentalCase.dentalCase.name);
  for (const dentalCase of dentalCaseFolders) {
    const completionStatus =
      completedDentalCasesNames.indexOf(dentalCase.dentalCase.name) !== -1
        ? CaseCompletionStatus.COMPLETED
        : inProgressDentalCasesNames.indexOf(dentalCase.dentalCase.name) !== -1
        ? CaseCompletionStatus.IN_PROGRESS
        : CaseCompletionStatus.NOT_STARTED;
    const updatedDentalCase = Object.assign(new DentalCaseFolder(), dentalCase);
    updatedDentalCase.completionStatus = completionStatus;
    updatedDentalCaseFolders.push(updatedDentalCase);
  }
  return updatedDentalCaseFolders;
}
