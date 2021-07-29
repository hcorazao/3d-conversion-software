import { initializeBabylonMainApplication, babylonApi } from '@app/modules/rendering/index';
import { Injectable } from '@angular/core';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { AppFacade } from '@app/facade/app-facade';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import {
  CaseInitiallyLoaded,
  ExportResult,
  PreparationMarginEntered,
  PreparationMarginEdited,
  PreparationMarginEditing,
  CopyLineActivated,
  CopyLineDeactivated,
  ExportFileToCaseFolderLocation,
  ImportCaseAdditionalFile,
  BabylonActionType,
  PreparationMarginEntering,
  ConfigureUndoRedoButtons,
  SetUndoButtonEnability,
  SetRedoButtonEnability,
  PossibleStepperJumpsChecked,
  CheckPossibleStepperJumps,
  ToggleExportButton,
} from '@app/store/actions/babylon.actions';
import { CaseProcessingMainStep, CaseProcessingStep, getCaseProcessingMainStepForStepValue } from '@app/models/enums/case-processing-step';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { DevSettings } from '@app/models/dev-settings.model';
import { ToolsSettings } from '@app/models/tools-settings.model';
import {
  UpdatedCaseObjectsSettings,
  UpdatedToolsSettings,
  RegisterToolRadiusChangeListener,
  RegisterToolsSettingsChangeListener,
} from '@app/store/actions/settings.actions';
import { Observable, Observer } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { DesignParameters } from '@app/models/design-parameters.model';
import { StepperJumpsConfiguration } from '@app/models/stepper-jumps-configuration.model';
import { TransitionEnum } from '@app/modules/rendering/workflows/transitions/TransitionEnum';
import { ToolRadiusChangeListenerType, ToolsSettingsChangeListenerType } from '@app/facade/app-facade-api';
import { UserGroups } from '@app/models/user.model';

@Injectable({ providedIn: 'root' })
export class EngineService {
  toolsSettings: ToolsSettings = undefined;
  loadedDentalCaseFolder: DentalCaseFolder = undefined;
  designParameters: DesignParameters = undefined;
  userGroups: UserGroups;

  public constructor(private store: Store, private actions: Actions) {
    this.subscribeToStoreValues();
    this.subscribeToUserGroups();
  }

  private subscribeToStoreValues() {
    this.store.pipe(select(fromSelectors.getToolsSettings)).subscribe((toolsSettings: ToolsSettings) => {
      this.toolsSettings = toolsSettings;
    });
    this.store.pipe(select(fromSelectors.getDentalCaseFolder)).subscribe((dentalCaseFolder: DentalCaseFolder) => {
      if (dentalCaseFolder) {
        this.loadedDentalCaseFolder = dentalCaseFolder.copy();
      } else {
        this.loadedDentalCaseFolder = dentalCaseFolder;
      }
    });
    this.store.pipe(select(fromSelectors.getDesignParameters)).subscribe((designParameters: DesignParameters) => {
      this.designParameters = designParameters;
    });
    this.store.pipe(select(fromSelectors.getCaseProcessingStep)).subscribe((_: CaseProcessingStep) => {
      this.store.dispatch(new CheckPossibleStepperJumps());
    });
  }

  subscribeToUserGroups() {
    this.store.pipe(select(fromSelectors.getUserGroups)).subscribe((userGroups) => {
      this.userGroups = userGroups;
    });
  }

  public initializeBabylon(canvasElementId: string) {
    initializeBabylonMainApplication(
      canvasElementId,
      new AppFacade({
        notifyCaseInitiallyLoaded: () => this.store.dispatch(new CaseInitiallyLoaded()),
        notifyPreparationMarginEntering: () => this.store.dispatch(new PreparationMarginEntering()),
        notifyPreparationMarginEntered: () => this.store.dispatch(new PreparationMarginEntered()),
        notifyPreparationMarginEditing: () => this.store.dispatch(new PreparationMarginEditing()),
        notifyPreparationMarginEdited: () => this.store.dispatch(new PreparationMarginEdited()),
        notifyCopyLineActivated: () => this.store.dispatch(new CopyLineActivated()),
        notifyCopyLineDeactivated: () => this.store.dispatch(new CopyLineDeactivated()),
        exportToExportFolder: (file: File) => this.store.dispatch(new ExportResult({ file })),
        exportToCaseFolderLocation: (file: File) => this.store.dispatch(new ExportFileToCaseFolderLocation({ file })),
        updateCaseObjectsSettings: (caseObjectsSettings: CaseObjectsSettings) =>
          this.store.dispatch(new UpdatedCaseObjectsSettings({ caseObjectsSettings })),
        importCaseAdditionalFile: this.importCaseAdditionalFile.bind(this),
        getToolsSettings: () => this.toolsSettings,
        updateToolsSettings: (toolsSettings: ToolsSettings) => this.store.dispatch(new UpdatedToolsSettings({ toolsSettings })),
        getLoadedDentalCaseFolder: () => this.loadedDentalCaseFolder,
        getDesignParamaters: () => this.designParameters,
        configureUndoRedoButtons: (undoCallback: () => void, redoCallback: () => void) =>
          this.store.dispatch(new ConfigureUndoRedoButtons({ undoCallback, redoCallback })),
        setUndoButtonEnability: (enabled: boolean) => this.store.dispatch(new SetUndoButtonEnability({ enabled })),
        setRedoButtonEnability: (enabled: boolean) => this.store.dispatch(new SetRedoButtonEnability({ enabled })),
        registerToolRadiusChangeListener: (callback: ToolRadiusChangeListenerType) =>
          this.store.dispatch(new RegisterToolRadiusChangeListener({ callback })),
        registerToolsSettingsChangeListener: (callback: ToolsSettingsChangeListenerType) =>
          this.store.dispatch(new RegisterToolsSettingsChangeListener({ callback })),
        toggleCadAssistantExportDisabled: (disabled: boolean) => this.store.dispatch(new ToggleExportButton({ disabled })),
        getUserGroups: (): UserGroups => {
          return this.userGroups;
        },
      })
    );
  }

  private importCaseAdditionalFile(fileName: string) {
    this.store.dispatch(new ImportCaseAdditionalFile({ fileName }));
    return new Observable((observer: Observer<any>) => {
      const subscription = this.actions.pipe(ofType(BabylonActionType.caseAdditionalFileImported)).subscribe((action: any) => {
        if (action.payload.fileName === fileName) {
          if (action.payload.error) {
            observer.error(action.payload.error);
          } else {
            observer.next(action.payload.file);
          }
          observer.complete();
          subscription.unsubscribe();
        }
      });
    });
  }

  public render(dentalCaseFolder: DentalCaseFolder) {
    babylonApi.fileRendering(dentalCaseFolder);
  }

  public changeCaseProcessingStep(currentStep: CaseProcessingStep, previousStep: CaseProcessingStep) {
    const currentMainStep = getCaseProcessingMainStepForStepValue(currentStep);
    const previousMainStep = getCaseProcessingMainStepForStepValue(previousStep);

    if (currentMainStep !== previousMainStep) {
      this.exitMainStep(previousMainStep);
    }
    this.exitSubstep(previousStep);
    if (currentMainStep !== previousMainStep) {
      this.enterMainStep(currentMainStep);
    }
    this.enterSubstep(currentStep);
  }

  private exitMainStep(mainStep: CaseProcessingMainStep) {
    switch (mainStep) {
      case CaseProcessingMainStep.PREPARATION_MARGIN:
        babylonApi.exitPreparationMargin();
        break;
      case CaseProcessingMainStep.INSERTION_AXIS:
        babylonApi.exitInsertionAxis();
        break;
      case CaseProcessingMainStep.COPY_LINE:
        babylonApi.stopEditCopyLine();
        babylonApi.exitCopyLine();
        break;
      case CaseProcessingMainStep.RESTORE:
        babylonApi.exitContactAndThickness();
        break;
    }
  }

  private exitSubstep(step: CaseProcessingStep) {
    switch (step) {
      case CaseProcessingStep.PREPARATION_MARGIN__EDITION:
        babylonApi.stopEditPreparationMargin();
        break;
    }
  }

  private enterMainStep(mainStep: CaseProcessingMainStep) {
    switch (mainStep) {
      case CaseProcessingMainStep.IMPORT:
        babylonApi.startImport();
        break;
      case CaseProcessingMainStep.INSERTION_AXIS:
        babylonApi.startInsertionAxis();
        break;
      case CaseProcessingMainStep.COPY_LINE:
        babylonApi.startCopyLine();
        break;
      case CaseProcessingMainStep.RESTORE:
        babylonApi.startContactAndThickness();
        break;
    }
  }

  private enterSubstep(step: CaseProcessingStep) {
    switch (step) {
      case CaseProcessingStep.PREPARATION_MARGIN__INSERTION:
        babylonApi.startPreparationMargin();
        break;
      case CaseProcessingStep.PREPARATION_MARGIN__EDITION:
        babylonApi.startEditMargin();
        break;
      case CaseProcessingStep.RESTORE__ADJUST_MESIAL_CONTACT:
        babylonApi.startRestoreAdjustMesialContact();
        break;
      case CaseProcessingStep.RESTORE__ADJUST_DISTAL_CONTACT:
        babylonApi.startRestoreAdjustDistalContact();
        break;
      case CaseProcessingStep.RESTORE__ADJUST_OCCLUSAL_CONTACT:
        babylonApi.startRestoreAdjustOcclusalContact();
        break;
    }
  }

  public resize() {
    babylonApi.resize();
  }

  public prepareResultExport() {
    babylonApi.prepareResultExport();
  }

  public updateCaseObjectsSettings(caseObjectsSettings: CaseObjectsSettings) {
    babylonApi.updateCaseObjectsSettings(caseObjectsSettings);
  }

  public restartCase(): boolean {
    return babylonApi.restartCase();
  }

  public updateDevSettings(devSettings: DevSettings) {
    babylonApi.updateDevSettings(devSettings);
  }

  public resetScene() {
    babylonApi.resetCamera();
  }

  public updateToolsSettings(toolsSettings: ToolsSettings) {
    babylonApi.updateToolsSettings(toolsSettings);
  }

  public updateDesignParameters(designParameters: DesignParameters) {
    babylonApi.updateDesignParameters(designParameters);
  }

  public makeBabylonDebugCall() {
    babylonApi.debug();
  }

  public checkPossibleStepperJumps(caseProcessingStep: CaseProcessingStep) {
    const stepperJumpsConfiguration = StepperJumpsConfiguration.builder()
      .withTransitionEnumsAndTargetSubstepsForProcessingMainStep(caseProcessingStep)
      .withCheckTransitionAvailabilityCallback(babylonApi.isTransitionAvailable)
      .build();
    this.store.dispatch(new PossibleStepperJumpsChecked({ stepperJumpsConfiguration }));
  }

  public jumpToCaseProcessingStepWithTransition(transition: TransitionEnum): boolean {
    return babylonApi.makeTransition(transition);
  }
}
