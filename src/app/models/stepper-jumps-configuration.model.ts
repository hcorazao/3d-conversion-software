import { CaseProcessingMainStep, CaseProcessingStep } from './enums/case-processing-step';
import { TransitionEnum } from '@app/modules/rendering/workflows/transitions/TransitionEnum';

export class StepperJumpsConfiguration {
  public importStepJumpAvailable: boolean;
  public preparationMarginStepJumpAvailable: boolean;
  public insertionAxisStepJumpAvailable: boolean;
  public copyLineStepJumpAvailable: boolean;
  public restoreStepJumpAvailable: boolean;
  public exportStepJumpAvailable: boolean;

  public transitionToImport: TransitionEnum | null;
  public transitionToPreparationMargin: TransitionEnum | null;
  public transitionToInsertionAxis: TransitionEnum | null;
  public transitionToCopyLine: TransitionEnum | null;
  public transitionToRestore: TransitionEnum | null;
  public transitionToExport: TransitionEnum | null;

  public importTargetSubstep: CaseProcessingStep;
  public preparationMarginTargetSubstep: CaseProcessingStep;
  public insertionAxisTargetSubstep: CaseProcessingStep;
  public copyLineTargetSubstep: CaseProcessingStep;
  public restoreTargetSubstep: CaseProcessingStep;

  static createDefault() {
    return this.builder()
      .withImportStepJumpAvailable(false)
      .withPreparationMarginStepJumpAvailable(false)
      .withInsertionAxisStepJumpAvailable(false)
      .withCopyLineStepJumpAvailable(false)
      .withRestoreStepJumpAvailable(false)
      .withExportStepJumpAvailable(false)
      .withTransitionEnumsAndTargetSubstepsForProcessingMainStep(null)
      .build();
  }

  static createByUpdating(base: StepperJumpsConfiguration, update: StepperJumpsConfiguration): StepperJumpsConfiguration {
    const result = new StepperJumpsConfiguration();
    result.importStepJumpAvailable = this.chooseUpdatingValue(base?.importStepJumpAvailable, update?.importStepJumpAvailable);
    result.preparationMarginStepJumpAvailable = this.chooseUpdatingValue(
      base?.preparationMarginStepJumpAvailable,
      update?.preparationMarginStepJumpAvailable
    );
    result.insertionAxisStepJumpAvailable = this.chooseUpdatingValue(
      base?.insertionAxisStepJumpAvailable,
      update?.insertionAxisStepJumpAvailable
    );
    result.copyLineStepJumpAvailable = this.chooseUpdatingValue(base?.copyLineStepJumpAvailable, update?.copyLineStepJumpAvailable);
    result.restoreStepJumpAvailable = this.chooseUpdatingValue(base?.restoreStepJumpAvailable, update?.restoreStepJumpAvailable);
    result.exportStepJumpAvailable = this.chooseUpdatingValue(base?.exportStepJumpAvailable, update?.exportStepJumpAvailable);

    result.transitionToImport = this.chooseUpdatingValue(base?.transitionToImport, update?.transitionToImport);
    result.transitionToPreparationMargin = this.chooseUpdatingValue(
      base?.transitionToPreparationMargin,
      update?.transitionToPreparationMargin
    );
    result.transitionToInsertionAxis = this.chooseUpdatingValue(base?.transitionToInsertionAxis, update?.transitionToInsertionAxis);
    result.transitionToCopyLine = this.chooseUpdatingValue(base?.transitionToCopyLine, update?.transitionToCopyLine);
    result.transitionToRestore = this.chooseUpdatingValue(base?.transitionToRestore, update?.transitionToRestore);
    result.transitionToExport = this.chooseUpdatingValue(base?.transitionToExport, update?.transitionToExport);

    result.importTargetSubstep = this.chooseUpdatingValue(base?.importTargetSubstep, update?.importTargetSubstep);
    result.preparationMarginTargetSubstep = this.chooseUpdatingValue(
      base?.preparationMarginTargetSubstep,
      update?.preparationMarginTargetSubstep
    );
    result.insertionAxisTargetSubstep = this.chooseUpdatingValue(base?.insertionAxisTargetSubstep, update?.insertionAxisTargetSubstep);
    result.copyLineTargetSubstep = this.chooseUpdatingValue(base?.copyLineTargetSubstep, update?.copyLineTargetSubstep);
    result.restoreTargetSubstep = this.chooseUpdatingValue(base?.restoreTargetSubstep, update?.restoreTargetSubstep);
    return result;
  }

  private static chooseUpdatingValue<T>(baseValue: T, updateValue: T): T {
    return updateValue === undefined ? baseValue : updateValue;
  }

  static builder() {
    return new StepperJumpsConfigurationBuilder();
  }

  getStepsAvailabilitiesArray() {
    const array = [];
    array[CaseProcessingMainStep.IMPORT] = this.importStepJumpAvailable;
    array[CaseProcessingMainStep.PREPARATION_MARGIN] = this.preparationMarginStepJumpAvailable;
    array[CaseProcessingMainStep.INSERTION_AXIS] = this.insertionAxisStepJumpAvailable;
    array[CaseProcessingMainStep.COPY_LINE] = this.copyLineStepJumpAvailable;
    array[CaseProcessingMainStep.RESTORE] = this.restoreStepJumpAvailable;
    return array;
  }

  getStepsTransitionsArray() {
    const array = [];
    array[CaseProcessingMainStep.IMPORT] = this.transitionToImport;
    array[CaseProcessingMainStep.PREPARATION_MARGIN] = this.transitionToPreparationMargin;
    array[CaseProcessingMainStep.INSERTION_AXIS] = this.transitionToInsertionAxis;
    array[CaseProcessingMainStep.COPY_LINE] = this.transitionToCopyLine;
    array[CaseProcessingMainStep.RESTORE] = this.transitionToRestore;
    return array;
  }

  getTargetSubstepsArray() {
    const array = [];
    array[CaseProcessingMainStep.IMPORT] = this.importTargetSubstep;
    array[CaseProcessingMainStep.PREPARATION_MARGIN] = this.preparationMarginTargetSubstep;
    array[CaseProcessingMainStep.INSERTION_AXIS] = this.insertionAxisTargetSubstep;
    array[CaseProcessingMainStep.COPY_LINE] = this.copyLineTargetSubstep;
    array[CaseProcessingMainStep.RESTORE] = this.restoreTargetSubstep;
    return array;
  }
}

export class StepperJumpsConfigurationBuilder {
  stepperJumpsConfiguration: StepperJumpsConfiguration;
  private checkTransitionAvailabilityCallback: (TransitionEnum) => boolean;

  constructor() {
    this.stepperJumpsConfiguration = new StepperJumpsConfiguration();
  }

  withImportStepJumpAvailable(importStepJumpAvailable: boolean): StepperJumpsConfigurationBuilder {
    this.stepperJumpsConfiguration.importStepJumpAvailable = importStepJumpAvailable;
    return this;
  }

  withPreparationMarginStepJumpAvailable(preparationMarginStepJumpAvailable: boolean): StepperJumpsConfigurationBuilder {
    this.stepperJumpsConfiguration.preparationMarginStepJumpAvailable = preparationMarginStepJumpAvailable;
    return this;
  }

  withInsertionAxisStepJumpAvailable(insertionAxisStepJumpAvailable: boolean): StepperJumpsConfigurationBuilder {
    this.stepperJumpsConfiguration.insertionAxisStepJumpAvailable = insertionAxisStepJumpAvailable;
    return this;
  }

  withCopyLineStepJumpAvailable(copyLineStepJumpAvailable: boolean): StepperJumpsConfigurationBuilder {
    this.stepperJumpsConfiguration.copyLineStepJumpAvailable = copyLineStepJumpAvailable;
    return this;
  }

  withRestoreStepJumpAvailable(restoreStepJumpAvailable: boolean): StepperJumpsConfigurationBuilder {
    this.stepperJumpsConfiguration.restoreStepJumpAvailable = restoreStepJumpAvailable;
    return this;
  }

  withExportStepJumpAvailable(exportStepJumpAvailable: boolean): StepperJumpsConfigurationBuilder {
    this.stepperJumpsConfiguration.exportStepJumpAvailable = exportStepJumpAvailable;
    return this;
  }

  withCheckTransitionAvailabilityCallback(
    checkTransitionAvailabilityCallback: (TransitionEnum) => boolean
  ): StepperJumpsConfigurationBuilder {
    this.checkTransitionAvailabilityCallback = checkTransitionAvailabilityCallback;
    return this;
  }

  withTransitionEnumsAndTargetSubstepsForProcessingMainStep(currentStep: CaseProcessingStep): StepperJumpsConfigurationBuilder {
    this.stepperJumpsConfiguration.importTargetSubstep = CaseProcessingStep.IMPORT;
    this.stepperJumpsConfiguration.preparationMarginTargetSubstep = CaseProcessingStep.PREPARATION_MARGIN__EDITION;
    this.stepperJumpsConfiguration.insertionAxisTargetSubstep = CaseProcessingStep.INSERTION_AXIS;
    this.stepperJumpsConfiguration.copyLineTargetSubstep = CaseProcessingStep.COPY_LINE;
    this.stepperJumpsConfiguration.restoreTargetSubstep = CaseProcessingStep.RESTORE__ADJUST_OCCLUSAL_CONTACT;
    switch (currentStep) {
      case CaseProcessingStep.PREPARATION_MARGIN__INSERTION:
        this.stepperJumpsConfiguration.transitionToImport = TransitionEnum.EnterPrepMargin2AppStarted;
        this.stepperJumpsConfiguration.transitionToPreparationMargin = null;
        this.stepperJumpsConfiguration.transitionToInsertionAxis = TransitionEnum.PrepMargin2InsertionAxis;
        this.stepperJumpsConfiguration.transitionToCopyLine = TransitionEnum.PrepMargin2CopyLine;
        this.stepperJumpsConfiguration.transitionToRestore = TransitionEnum.PrepMargin2CopyRestoration;
        this.stepperJumpsConfiguration.transitionToExport = TransitionEnum.PrepMargin2ExportRestoration;
        break;
      case CaseProcessingStep.PREPARATION_MARGIN__EDITION:
        this.stepperJumpsConfiguration.transitionToImport = TransitionEnum.PrepMarginEntered2AppStarted;
        this.stepperJumpsConfiguration.transitionToPreparationMargin = null;
        this.stepperJumpsConfiguration.transitionToInsertionAxis = TransitionEnum.PrepMargin2InsertionAxis;
        this.stepperJumpsConfiguration.transitionToCopyLine = TransitionEnum.PrepMargin2CopyLine;
        this.stepperJumpsConfiguration.transitionToRestore = TransitionEnum.PrepMargin2CopyRestoration;
        this.stepperJumpsConfiguration.transitionToExport = TransitionEnum.PrepMargin2ExportRestoration;
        break;
      case CaseProcessingStep.INSERTION_AXIS:
        this.stepperJumpsConfiguration.transitionToImport = TransitionEnum.InsertionAxis2AppStarted;
        this.stepperJumpsConfiguration.transitionToPreparationMargin = TransitionEnum.InsertionAxis2PrepMargin;
        this.stepperJumpsConfiguration.transitionToInsertionAxis = null;
        this.stepperJumpsConfiguration.transitionToCopyLine = TransitionEnum.InsertionAxis2CopyLine;
        this.stepperJumpsConfiguration.transitionToRestore = TransitionEnum.InsertionAxis2CopyRestoration;
        this.stepperJumpsConfiguration.transitionToExport = TransitionEnum.InsertionAxis2ExportRestoration;
        break;
      case CaseProcessingStep.COPY_LINE:
        this.stepperJumpsConfiguration.transitionToImport = TransitionEnum.CopyLine2AppStarted;
        this.stepperJumpsConfiguration.transitionToPreparationMargin = TransitionEnum.CopyLine2PrepMargin;
        this.stepperJumpsConfiguration.transitionToInsertionAxis = TransitionEnum.CopyLine2InsertionAxis;
        this.stepperJumpsConfiguration.transitionToCopyLine = null;
        this.stepperJumpsConfiguration.transitionToRestore = TransitionEnum.CopyLine2CopyRestoration;
        this.stepperJumpsConfiguration.transitionToExport = TransitionEnum.CopyLine2ExportRestoration;
        break;
      case CaseProcessingStep.RESTORE__ADJUST_MESIAL_CONTACT:
        this.stepperJumpsConfiguration.transitionToImport = TransitionEnum.CopyRestoration2AppStarted;
        this.stepperJumpsConfiguration.transitionToPreparationMargin = TransitionEnum.CopyRestoration2PrepMargin;
        this.stepperJumpsConfiguration.transitionToInsertionAxis = TransitionEnum.CopyRestoration2InsertionAxis;
        this.stepperJumpsConfiguration.transitionToCopyLine = TransitionEnum.CopyRestoration2CopyLine;
        this.stepperJumpsConfiguration.transitionToRestore = null;
        this.stepperJumpsConfiguration.transitionToExport = null;
        break;
      case CaseProcessingStep.RESTORE__ADJUST_DISTAL_CONTACT:
        this.stepperJumpsConfiguration.transitionToImport = TransitionEnum.CopyRestoration2AppStarted;
        this.stepperJumpsConfiguration.transitionToPreparationMargin = TransitionEnum.CopyRestoration2PrepMargin;
        this.stepperJumpsConfiguration.transitionToInsertionAxis = TransitionEnum.CopyRestoration2InsertionAxis;
        this.stepperJumpsConfiguration.transitionToCopyLine = TransitionEnum.CopyRestoration2CopyLine;
        this.stepperJumpsConfiguration.transitionToRestore = null;
        this.stepperJumpsConfiguration.transitionToExport = null;
        break;
      case CaseProcessingStep.RESTORE__ADJUST_OCCLUSAL_CONTACT:
        this.stepperJumpsConfiguration.transitionToImport = TransitionEnum.CopyRestoration2AppStarted;
        this.stepperJumpsConfiguration.transitionToPreparationMargin = TransitionEnum.CopyRestoration2PrepMargin;
        this.stepperJumpsConfiguration.transitionToInsertionAxis = TransitionEnum.CopyRestoration2InsertionAxis;
        this.stepperJumpsConfiguration.transitionToCopyLine = TransitionEnum.CopyRestoration2CopyLine;
        this.stepperJumpsConfiguration.transitionToRestore = null;
        this.stepperJumpsConfiguration.transitionToExport = null;
        break;
      default:
        this.stepperJumpsConfiguration.transitionToImport = null;
        this.stepperJumpsConfiguration.transitionToPreparationMargin = null;
        this.stepperJumpsConfiguration.transitionToInsertionAxis = null;
        this.stepperJumpsConfiguration.transitionToCopyLine = null;
        this.stepperJumpsConfiguration.transitionToRestore = null;
        this.stepperJumpsConfiguration.transitionToExport = null;
        break;
    }
    return this;
  }

  build(): StepperJumpsConfiguration {
    if (this.checkTransitionAvailabilityCallback) {
      this.stepperJumpsConfiguration.importStepJumpAvailable = this.stepperJumpsConfiguration.transitionToImport
        ? this.checkTransitionAvailabilityCallback(this.stepperJumpsConfiguration.transitionToImport)
        : this.stepperJumpsConfiguration.importStepJumpAvailable || false;
      this.stepperJumpsConfiguration.preparationMarginStepJumpAvailable = this.stepperJumpsConfiguration.transitionToPreparationMargin
        ? this.checkTransitionAvailabilityCallback(this.stepperJumpsConfiguration.transitionToPreparationMargin)
        : this.stepperJumpsConfiguration.preparationMarginStepJumpAvailable || false;
      this.stepperJumpsConfiguration.insertionAxisStepJumpAvailable = this.stepperJumpsConfiguration.transitionToInsertionAxis
        ? this.checkTransitionAvailabilityCallback(this.stepperJumpsConfiguration.transitionToInsertionAxis)
        : this.stepperJumpsConfiguration.insertionAxisStepJumpAvailable || false;
      this.stepperJumpsConfiguration.copyLineStepJumpAvailable = this.stepperJumpsConfiguration.transitionToCopyLine
        ? this.checkTransitionAvailabilityCallback(this.stepperJumpsConfiguration.transitionToCopyLine)
        : this.stepperJumpsConfiguration.copyLineStepJumpAvailable || false;
      this.stepperJumpsConfiguration.restoreStepJumpAvailable = this.stepperJumpsConfiguration.transitionToRestore
        ? this.checkTransitionAvailabilityCallback(this.stepperJumpsConfiguration.transitionToRestore)
        : this.stepperJumpsConfiguration.restoreStepJumpAvailable || false;
      this.stepperJumpsConfiguration.exportStepJumpAvailable = this.stepperJumpsConfiguration.transitionToExport
        ? this.checkTransitionAvailabilityCallback(this.stepperJumpsConfiguration.transitionToExport)
        : this.stepperJumpsConfiguration.exportStepJumpAvailable || false;
    }
    return this.stepperJumpsConfiguration;
  }
}
