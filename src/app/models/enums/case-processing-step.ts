export enum CaseProcessingMainStep {
  NONE = 0,
  IMPORT = 1,
  PREPARATION_MARGIN = 2,
  INSERTION_AXIS = 3,
  COPY_LINE = 4,
  RESTORE = 5,
}

export const getCaseProcessingMainStepByValue = (mainStepValue): CaseProcessingMainStep => {
  switch (mainStepValue) {
    case 1:
      return CaseProcessingMainStep.IMPORT;
    case 2:
      return CaseProcessingMainStep.PREPARATION_MARGIN;
    case 3:
      return CaseProcessingMainStep.INSERTION_AXIS;
    case 4:
      return CaseProcessingMainStep.COPY_LINE;
    case 5:
      return CaseProcessingMainStep.RESTORE;
    default:
      return CaseProcessingMainStep.NONE;
  }
};

export enum CaseProcessingStep {
  NONE = 0,
  IMPORT = 1,
  PREPARATION_MARGIN__INSERTION = 2,
  PREPARATION_MARGIN__EDITION = 3,
  INSERTION_AXIS = 4,
  COPY_LINE = 5,
  RESTORE__ADJUST_MESIAL_CONTACT = 6,
  RESTORE__ADJUST_DISTAL_CONTACT = 7,
  RESTORE__ADJUST_OCCLUSAL_CONTACT = 8,
}

export const getCaseProcessingStepByValue = (stepValue): CaseProcessingStep => {
  switch (stepValue) {
    case 1:
      return CaseProcessingStep.IMPORT;
    case 2:
      return CaseProcessingStep.PREPARATION_MARGIN__INSERTION;
    case 3:
      return CaseProcessingStep.PREPARATION_MARGIN__EDITION;
    case 4:
      return CaseProcessingStep.INSERTION_AXIS;
    case 5:
      return CaseProcessingStep.COPY_LINE;
    case 6:
      return CaseProcessingStep.RESTORE__ADJUST_MESIAL_CONTACT;
    case 7:
      return CaseProcessingStep.RESTORE__ADJUST_DISTAL_CONTACT;
    case 8:
      return CaseProcessingStep.RESTORE__ADJUST_OCCLUSAL_CONTACT;
    default:
      return CaseProcessingStep.NONE;
  }
};

export const getCaseProcessingMainStepForStepValue = (stepValue: CaseProcessingStep): CaseProcessingMainStep => {
  switch (stepValue) {
    case CaseProcessingStep.IMPORT:
      return CaseProcessingMainStep.IMPORT;
    case CaseProcessingStep.PREPARATION_MARGIN__INSERTION:
      return CaseProcessingMainStep.PREPARATION_MARGIN;
    case CaseProcessingStep.PREPARATION_MARGIN__EDITION:
      return CaseProcessingMainStep.PREPARATION_MARGIN;
    case CaseProcessingStep.INSERTION_AXIS:
      return CaseProcessingMainStep.INSERTION_AXIS;
    case CaseProcessingStep.COPY_LINE:
      return CaseProcessingMainStep.COPY_LINE;
    case CaseProcessingStep.RESTORE__ADJUST_MESIAL_CONTACT:
      return CaseProcessingMainStep.RESTORE;
    case CaseProcessingStep.RESTORE__ADJUST_DISTAL_CONTACT:
      return CaseProcessingMainStep.RESTORE;
    case CaseProcessingStep.RESTORE__ADJUST_OCCLUSAL_CONTACT:
      return CaseProcessingMainStep.RESTORE;
    default:
      return CaseProcessingMainStep.NONE;
  }
};

export const getSubstepForStep = (step: CaseProcessingStep): number => {
  switch (step) {
    case CaseProcessingStep.IMPORT:
      return 1;
    case CaseProcessingStep.PREPARATION_MARGIN__INSERTION:
      return 1;
    case CaseProcessingStep.PREPARATION_MARGIN__EDITION:
      return 2;
    case CaseProcessingStep.INSERTION_AXIS:
      return 1;
    case CaseProcessingStep.COPY_LINE:
      return 1;
    case CaseProcessingStep.RESTORE__ADJUST_MESIAL_CONTACT:
      return 1;
    case CaseProcessingStep.RESTORE__ADJUST_DISTAL_CONTACT:
      return 2;
    case CaseProcessingStep.RESTORE__ADJUST_OCCLUSAL_CONTACT:
      return 3;
    default:
      return CaseProcessingMainStep.NONE;
  }
};
