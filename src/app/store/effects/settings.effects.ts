import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { of } from 'rxjs';
import { mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { SettingsService } from '@app/modules/layout/services/settings.service';
import {
  SettingsActionType,
  UpdateImportFolderPreference,
  UpdateExportFolderPreference,
  LoadSettings,
  UpdateLanguagePreference,
  UpdateDesignParameters,
  UpdateDentalNotationPreference,
} from '../actions/settings.actions';
import { EngineService } from '@app/modules/engine3d/engine/engine.service';
import { ToolsSettingsChangeListenerType, ToolRadiusChangeListenerType } from '@app/facade/app-facade-api';

@Injectable()
export class SettingsEffects {
  constructor(
    private store: Store,
    private actions$: Actions,
    private settingsService: SettingsService,
    private engineService: EngineService
  ) {}

  @Effect()
  loadSettings$ = this.actions$.pipe(
    ofType(SettingsActionType.loadSettings),
    mergeMap((action: LoadSettings) => {
      this.settingsService.loadSettings();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  updateDesignParameters$ = this.actions$.pipe(
    ofType(SettingsActionType.updateDesignParameters),
    mergeMap((action: UpdateDesignParameters) => {
      const designParameters = action.payload.designParameters;
      this.settingsService.updateDesignParameters(designParameters);
      this.engineService.updateDesignParameters(designParameters);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  updateImportFolderPreference$ = this.actions$.pipe(
    ofType(SettingsActionType.updateImportFolderPreference),
    mergeMap((action: UpdateImportFolderPreference) => {
      this.settingsService.updateImportFolderPreference(action.payload.importFolder);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  updateExportFolderPreference$ = this.actions$.pipe(
    ofType(SettingsActionType.updateExportFolderPreference),
    mergeMap((action: UpdateExportFolderPreference) => {
      this.settingsService.updateExportFolderPreference(action.payload.exportFolder);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  updateLanguagePreference$ = this.actions$.pipe(
    ofType(SettingsActionType.updateLanguagePreference),
    mergeMap((action: UpdateLanguagePreference) => {
      this.settingsService.updateLanguagePreference(action.payload.language);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  updateDentalNotationPreference = this.actions$.pipe(
    ofType(SettingsActionType.updateDentalNotationPreference),
    mergeMap((action: UpdateDentalNotationPreference) => {
      this.settingsService.updateDentalNotationPreference(action.payload.dentalNotation);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  updateCaseObjectsSettings$ = this.actions$.pipe(
    ofType(SettingsActionType.updatedCaseObjectsSettings),
    switchMap((action: any) => {
      this.engineService.updateCaseObjectsSettings(action.payload.caseObjectsSettings);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  updatedToolsSettings$ = this.actions$.pipe(
    ofType(SettingsActionType.updatedToolsSettings),
    withLatestFrom(
      this.store.pipe(select(fromSelectors.getToolsSettings)),
      this.store.pipe(select(fromSelectors.getToolRadiusChangeCallback)),
      this.store.pipe(select(fromSelectors.getToolsSettingsChangeCallback))
    ),
    switchMap(([action, toolsSettings, toolRadiusChangeCallback, toolsSettingsChangeCallback]) => {
      this.settingsService.updateToolsSettings(toolsSettings);
      this.engineService.updateToolsSettings(toolsSettings);
      if (toolsSettingsChangeCallback) {
        (toolsSettingsChangeCallback as ToolsSettingsChangeListenerType)(toolsSettings);
      }
      const toolRadius = (action as any).payload.toolsSettings?.toolRadius;
      if (toolRadius !== undefined && toolRadius !== null && toolRadiusChangeCallback) {
        (toolRadiusChangeCallback as ToolRadiusChangeListenerType)(toolRadius);
      }
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  updateDevSettings$ = this.actions$.pipe(
    ofType(SettingsActionType.updateDevSettings),
    switchMap((action: any) => {
      this.engineService.updateDevSettings(action.payload.devSettings);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  saveToggledSidebar$ = this.actions$.pipe(
    ofType(SettingsActionType.toggleSidebar),
    withLatestFrom(this.store.pipe(select(fromSelectors.isSidebarOpen))),
    switchMap(([action, sidebarOpen]) => {
      this.settingsService.updateSidebarSettings(sidebarOpen);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  saveUpdatedAllToolboxesSettings = this.actions$.pipe(
    ofType(SettingsActionType.updateAllToolboxesSettings),
    withLatestFrom(this.store.pipe(select(fromSelectors.getAllToolboxesSettings))),
    switchMap(([action, allToolboxesSettings]) => {
      this.settingsService.updateAllToolboxesSettings(allToolboxesSettings);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  saveUpdatedProfileDetailsSettings = this.actions$.pipe(
    ofType(SettingsActionType.updateProfileDetails),
    withLatestFrom(this.store.pipe(select(fromSelectors.getProfileDetails))),
    switchMap(([action, profileDetails]) => {
      this.settingsService.updateProfileDetails(profileDetails);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  removeProfileImage = this.actions$.pipe(
    ofType(SettingsActionType.removeProfileImage),
    withLatestFrom(this.store.pipe(select(fromSelectors.getProfileDetails))),
    switchMap(([action, profileDetails]) => {
      this.settingsService.updateProfileDetails(profileDetails);
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  saveToggledPanelsVisibility = this.actions$.pipe(
    ofType(SettingsActionType.togglePanelsVisibility),
    withLatestFrom(this.store.pipe(select(fromSelectors.getAllToolboxesSettings))),
    switchMap(([action, allToolboxesSettings]) => {
      this.settingsService.updateAllToolboxesSettings(allToolboxesSettings);
      return of({ type: 'NO_ACTION' });
    })
  );
}
