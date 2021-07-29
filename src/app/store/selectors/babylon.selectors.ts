import { createFeatureSelector, createSelector } from '@ngrx/store';

import { BabylonState } from '@app/store/states';
import {
  CaseProcessingMainStep,
  getCaseProcessingMainStepForStepValue,
  getSubstepForStep,
  CaseProcessingStep,
} from '@app/models/enums/case-processing-step';

export const getBabylonStore = createFeatureSelector('babylon');

export const getDentalCaseFolder = createSelector(getBabylonStore, (babylonState: BabylonState) => babylonState.dentalCaseFolder);

export const isCaseFolderImportComponentVisible = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.caseFolderImportComponentVisible
);

export const getCaseProcessingStep = createSelector(getBabylonStore, (babylonState: BabylonState) => babylonState.caseProcessingStep);

export const getCaseProcessingSubstep = createSelector(getBabylonStore, (babylonState: BabylonState) =>
  getSubstepForStep(babylonState.caseProcessingStep)
);

export const getPreviousCaseProcessingStep = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.previousCaseProcessingStep
);

export const isInitialCaseLoading = createSelector(getBabylonStore, (babylonState: BabylonState) => babylonState.initialCaseLoading);

export const getImportedDentalCaseFolders = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.importedDentalCaseFolders
);

export const areCasesAvailableToImportFromImportFolder = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) =>
    !babylonState.importingCasesFromImportFolder &&
    !babylonState.finishedImportingCasesFromImportFolder &&
    !babylonState.errorImportingCasesFromImportFolder
);

export const isImportingCasesFromImportFolder = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.importingCasesFromImportFolder
);

export const getRecentDentalCases = createSelector(getBabylonStore, (babylonState: BabylonState) => babylonState.recentDentalCases);

export const isPreparationMarginEntered = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.preparationMarginEntered
);
export const isObjectsToolboxVisible = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.caseProcessingStep !== CaseProcessingStep.IMPORT
);
export const isNextStepButtonDisabled = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) =>
    (getCaseProcessingMainStepForStepValue(babylonState.caseProcessingStep) === CaseProcessingMainStep.PREPARATION_MARGIN &&
      (!babylonState.preparationMarginEntered || babylonState.preparationMarginEditing)) ||
    (babylonState.caseProcessingStep === CaseProcessingStep.COPY_LINE && babylonState.copyLineActivated)
);
export const isPreviousStepButtonDisabled = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) =>
    babylonState.caseProcessingStep === CaseProcessingStep.IMPORT ||
    (babylonState.caseProcessingStep === CaseProcessingStep.PREPARATION_MARGIN__INSERTION && babylonState.preparationMarginEntering) ||
    (babylonState.caseProcessingStep === CaseProcessingStep.PREPARATION_MARGIN__EDITION && babylonState.preparationMarginEditing) ||
    (babylonState.caseProcessingStep === CaseProcessingStep.COPY_LINE && babylonState.copyLineActivated)
);
export const isToolsToolboxVisible = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => getCaseProcessingMainStepForStepValue(babylonState.caseProcessingStep) === CaseProcessingMainStep.RESTORE
);
export const isActionNotificationsVisible = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.caseProcessingStep === CaseProcessingStep.IMPORT
);
export const isFreshCasesNotificationVisible = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.caseProcessingStep === CaseProcessingStep.IMPORT
);
export const getPatientDentalCases = createSelector(getBabylonStore, (babylonState: BabylonState, props: { patientId: string }) => {
  if (babylonState.importedDentalCaseFolders) {
    return babylonState.importedDentalCaseFolders.filter(
      (dentalCaseFolder) => dentalCaseFolder.patient && dentalCaseFolder.patient.id === props.patientId
    );
  } else {
    return [];
  }
});
export const isUndoButtonEnabled = createSelector(getBabylonStore, (babylonState: BabylonState) => babylonState.undoButtonEnabled);
export const isRedoButtonEnabled = createSelector(getBabylonStore, (babylonState: BabylonState) => babylonState.redoButtonEnabled);
export const getUndoButtonCallback = createSelector(getBabylonStore, (babylonState: BabylonState) => babylonState.undoButtonCallback);
export const getRedoButtonCallback = createSelector(getBabylonStore, (babylonState: BabylonState) => babylonState.redoButtonCallback);
export const getStepperJumpsConfiguration = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.stepperJumpsConfiguration
);
export const getCadAssistantExportDisabled = createSelector(
  getBabylonStore,
  (babylonState: BabylonState) => babylonState.isCadAssistantExportDisabled
);
