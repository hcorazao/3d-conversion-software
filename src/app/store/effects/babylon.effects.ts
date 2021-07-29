import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, withLatestFrom, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { BabylonActionType } from '../actions';
import { ResultExportService } from '@app/shared/services/result-export.service';
import { CaseProcessingStep } from '@app/models/enums/case-processing-step';
import { EngineService } from '@app/modules/engine3d/engine/engine.service';
import { CaseLoadersManagerService } from '@app/modules/layout/services/case-loaders/case-loaders-manager.service';
import { DentalCasesImportService } from '@app/shared/services/dental-cases-import.service';
import { RecentDentalCasesService } from '@app/shared/services/recent-dental-cases.service';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { UpdatedCaseObjectsSettings } from '../actions/settings.actions';
import {
  AddToastNotificationByType,
  DisplayUploadNotification,
  FinishUploadingAllInUploadNotification,
} from '../actions/notifications.actions';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { CaseFileUpload } from '@app/models/case-file-upload.model';
import { ChangeCaseProcessingStep, StoppedLoadingCase, ChangedCaseProcessingStep, ToggleExportButton } from '../actions/babylon.actions';
import { FilesImportService } from '@app/shared/services/files-import.service';

@Injectable()
export class BabylonEffects {
  constructor(
    private store: Store,
    private actions$: Actions,
    private engineService: EngineService,
    private resultExportService: ResultExportService,
    private caseLoadersManagerService: CaseLoadersManagerService,
    private dentalCasesImportService: DentalCasesImportService,
    private recentDentalCasesService: RecentDentalCasesService,
    private filesImportService: FilesImportService
  ) {}

  @Effect()
  initializeBabylon$ = this.actions$.pipe(
    ofType(BabylonActionType.initializeBabylon),
    switchMap((action: any) => {
      this.engineService.initializeBabylon(action.payload.canvasElementId);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  folderHandleForCaseFolderUploaded$ = this.actions$.pipe(
    ofType(BabylonActionType.folderHandleForCaseFolderUploaded),
    switchMap((action: any) => {
      this.dentalCasesImportService.importDentalCaseFromFolderHandle(action.payload.folderHandle);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  parseUploadedFilesToCaseFolder$ = this.actions$.pipe(
    ofType(BabylonActionType.filesForCaseFolderUploaded),
    switchMap((action: any) => {
      this.caseLoadersManagerService.discoverCameraVendorLoadCaseFolderAndUploadToBabylon(
        action.payload.files,
        action.payload.folderName,
        action.payload.folderHandle
      );
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  prepareAndLoadCase$ = this.actions$.pipe(
    ofType(BabylonActionType.prepareAndLoadCase),
    switchMap((action: any) => {
      const { dentalCaseFolder, fromImportFolder } = action.payload;
      const caseLoadingAvailable = this.engineService.restartCase();
      if (caseLoadingAvailable) {
        this.caseLoadersManagerService.parseVectorFilesAndLoadCaseFolder(dentalCaseFolder, fromImportFolder);
        return of({ type: 'NO_ACTION' });
      } else {
        return [
          new AddToastNotificationByType({ type: ToastNotificationType.CANNOT_START_NEW_CASE_AFTER_RESTART_ERROR }),
          new StoppedLoadingCase(),
        ];
      }
    })
  );

  @Effect()
  loadCaseToBabylon$ = this.actions$.pipe(
    ofType(BabylonActionType.loadCase),
    switchMap((action: any) => {
      const { dentalCaseFolder, fromImportFolder } = action.payload;
      this.engineService.render(dentalCaseFolder);
      this.recentDentalCasesService.addRecentDentalCase(dentalCaseFolder, fromImportFolder);
      const newCaseObjectsSettings = CaseObjectsSettings.createForDentalCaseFolder(dentalCaseFolder);
      const caseFileUploads = CaseFileUpload.initiateCaseFileUploadsWithDentalCaseFolder(dentalCaseFolder);
      return [
        new UpdatedCaseObjectsSettings({ caseObjectsSettings: newCaseObjectsSettings }),
        new DisplayUploadNotification({ caseFileUploads }),
      ];
    })
  );

  @Effect()
  goToPreparationMarginAfterCaseInitiallyLoaded$ = this.actions$.pipe(
    ofType(BabylonActionType.caseInitiallyLoaded),
    map(() => new ChangeCaseProcessingStep({ step: CaseProcessingStep.PREPARATION_MARGIN__INSERTION }))
  );

  @Effect()
  notifyAfterCaseInitiallyLoaded$ = this.actions$.pipe(
    ofType(BabylonActionType.caseInitiallyLoaded),
    switchMap(() => [
      new AddToastNotificationByType({ type: ToastNotificationType.CASE_IMPORTED_SUCCESSFULLY }),
      new FinishUploadingAllInUploadNotification(),
      new StoppedLoadingCase(),
    ])
  );

  @Effect()
  changeCaseProcessingStep$ = this.actions$.pipe(
    ofType(BabylonActionType.changeCaseProcessingStep),
    withLatestFrom(this.store.pipe(select(fromSelectors.getCaseProcessingStep))),
    filter(([action, previousStep]) => {
      return (action as any).payload.step !== previousStep;
    }),
    switchMap(([action, previousStep]) => {
      this.engineService.changeCaseProcessingStep((action as any).payload.step, previousStep);
      return [new ChangedCaseProcessingStep({ step: (action as any).payload.step })];
    })
  );

  @Effect()
  goToPreparationMarginEditionAfterPreparationMarginEntered$ = this.actions$.pipe(
    ofType(BabylonActionType.preparationMarginEntered),
    switchMap(() => {
      return [new ChangeCaseProcessingStep({ step: CaseProcessingStep.PREPARATION_MARGIN__EDITION })];
    })
  );

  @Effect()
  prepareResultExport$ = this.actions$.pipe(
    ofType(BabylonActionType.prepareResultExport),
    switchMap(() => {
      this.engineService.prepareResultExport();
      return [new ToggleExportButton({ disabled: true })];
    })
  );

  @Effect()
  exportResult$ = this.actions$.pipe(
    ofType(BabylonActionType.exportResult),
    switchMap((action: any) => {
      this.resultExportService.exportFileToExportFolder(action.payload.file);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  exportFileToCaseFolderLocation$ = this.actions$.pipe(
    ofType(BabylonActionType.exportFileToCaseFolderLocation),
    withLatestFrom(this.store.pipe(select(fromSelectors.getDentalCaseFolder))),
    switchMap(([action, caseFolder]) => {
      this.resultExportService.exportFileToCaseFolderLocation((action as any).payload.file, caseFolder.folderHandle);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  restartCase$ = this.actions$.pipe(
    ofType(BabylonActionType.restartCase),
    switchMap(() => {
      this.engineService.restartCase();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  importCasesFromImportFolder$ = this.actions$.pipe(
    ofType(BabylonActionType.importCasesFromImportFolder),
    switchMap(() => {
      this.dentalCasesImportService.importDentalCases();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  loadRecentDentalCases$ = this.actions$.pipe(
    ofType(BabylonActionType.loadRecentDentalCases),
    switchMap(() => {
      this.recentDentalCasesService.loadRecentDentalCases();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  resetScene$ = this.actions$.pipe(
    ofType(BabylonActionType.resetScene),
    switchMap(() => {
      this.engineService.resetScene();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  saveCaseFolderLoadedWithError$ = this.actions$.pipe(
    ofType(BabylonActionType.errorLoadingCaseFolder),
    switchMap((action: any) => {
      const { dentalCaseFolder, fromImportFolder } = action.payload;
      this.recentDentalCasesService.addRecentDentalCase(dentalCaseFolder, fromImportFolder);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  importCaseAdditionalFile$ = this.actions$.pipe(
    ofType(BabylonActionType.importCaseAdditionalFile),
    withLatestFrom(this.store.pipe(select(fromSelectors.getDentalCaseFolder))),
    switchMap(([action, dentalCaseFolder]) => {
      this.filesImportService.importFileWithNameFromFolderHandle((action as any).payload.fileName, dentalCaseFolder.folderHandle);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  completeCase$ = this.actions$.pipe(
    ofType(BabylonActionType.completeCase),
    withLatestFrom(this.store.pipe(select(fromSelectors.getDentalCaseFolder))),
    switchMap(([_, dentalCaseFolder]) => {
      this.recentDentalCasesService.completeRecentDentalCase(dentalCaseFolder.dentalCase.name);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  babylonDebugCall$ = this.actions$.pipe(
    ofType(BabylonActionType.babylonDebugCall),
    switchMap(() => {
      this.engineService.makeBabylonDebugCall();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  undoActionInStep$ = this.actions$.pipe(
    ofType(BabylonActionType.undoActionInStep),
    withLatestFrom(this.store.pipe(select(fromSelectors.getUndoButtonCallback))),
    switchMap(([_, undoButtonCallback]) => {
      (undoButtonCallback as () => void)();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  redoActionInStep$ = this.actions$.pipe(
    ofType(BabylonActionType.redoActionInStep),
    withLatestFrom(this.store.pipe(select(fromSelectors.getRedoButtonCallback))),
    switchMap(([_, redoButtonCallback]) => {
      (redoButtonCallback as () => void)();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  checkPossibleStepperJumps$ = this.actions$.pipe(
    ofType(BabylonActionType.checkPossibleStepperJumps),
    withLatestFrom(this.store.pipe(select(fromSelectors.getCaseProcessingStep))),
    switchMap(([_, caseProcessingStep]) => {
      this.engineService.checkPossibleStepperJumps(caseProcessingStep as CaseProcessingStep);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  jumpToCaseProcessingStepWithTransition$ = this.actions$.pipe(
    ofType(BabylonActionType.jumpToCaseProcessingStepWithTransition),
    switchMap((action: any) => {
      if (this.engineService.jumpToCaseProcessingStepWithTransition(action.payload.jump.transitionToMake)) {
        return [new ChangedCaseProcessingStep({ step: action.payload.jump.destinationStep })];
      } else {
        return of({ type: 'NO_ACTION' });
      }
    })
  );
}
