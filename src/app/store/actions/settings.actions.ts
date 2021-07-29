import { Action } from '@ngrx/store';
import { ProfileDetails } from '@app/models/profile-details.model';
import { DesignParameters } from '@app/models/design-parameters.model';
import { ProfilePreferences } from '@app/models/profile-preferences.model';
import { Language } from '@app/models/enums/language.enum';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { ToolsSettings } from '@app/models/tools-settings.model';
import { DevSettings } from '@app/models/dev-settings.model';
import { AllToolboxesSettings } from '@app/models/all-toolboxes-settings.model';
import { ToolRadiusChangeListenerType, ToolsSettingsChangeListenerType } from '@app/facade/app-facade-api';
import { DentalNotation } from '@app/models/enums/jaw.enum';

export enum SettingsActionType {
  loadSettings = '[Settings] Load Settings',
  settingsLoaded = '[Settings] Settings Loaded',
  updateDesignParameters = '[Settings] Update Design Parameters',
  updateImportFolderPreference = '[Settings] Update Import Folder Preference',
  updateExportFolderPreference = '[Settings] Update Export fFolder Preference',
  updateLanguagePreference = '[Settings] Update Language Preference',
  updateDentalNotationPreference = '[Settings] Update Dental Notation Preference',
  updatedCaseObjectsSettings = '[Settings] Updated Case Objects Settings',
  updatedToolsSettings = '[Settings] Update Tools Settings',
  updateDevSettings = '[Settings] Update Dev Settings',
  toggleSidebar = '[Settings] Toggle Sidebar',
  closeSidebar = '[Settings] Close Sidebar',
  openSidebar = '[Settings] Open Sidebar',
  updateAllToolboxesSettings = '[Settings] Update All Toolboxes Settings',
  updateProfileDetails = '[Settings] Update Profile Details',
  removeProfileImage = '[Settings] Remove Profile Image',
  togglePanelsVisibility = '[Settings] Toggle Panels Visibility',
  registerToolRadiusChangeListener = '[Babylon] Register Tool Radius Change Listener',
  registerToolsSettingsChangeListener = '[Babylon] Register Tools Settings Change Listener',
  togglePanelsRepositioning = '[Settings] Toggle Panels Repositioning',
}

export class LoadSettings implements Action {
  readonly type = SettingsActionType.loadSettings;
}

export class SettingsLoaded implements Action {
  readonly type = SettingsActionType.settingsLoaded;
  constructor(
    public payload: {
      profileDetails: ProfileDetails;
      designParameters: DesignParameters;
      profilePreferences: ProfilePreferences;
      toolsSettings: ToolsSettings;
      sidebarOpen: boolean;
      allToolboxesSettings: AllToolboxesSettings;
    }
  ) {}
}

export class UpdateDesignParameters implements Action {
  readonly type = SettingsActionType.updateDesignParameters;
  constructor(public payload: { designParameters: DesignParameters }) {}
}

export class UpdateImportFolderPreference implements Action {
  readonly type = SettingsActionType.updateImportFolderPreference;
  constructor(public payload: { importFolder: any }) {}
}

export class UpdateExportFolderPreference implements Action {
  readonly type = SettingsActionType.updateExportFolderPreference;
  constructor(public payload: { exportFolder: any }) {}
}

export class UpdateLanguagePreference implements Action {
  readonly type = SettingsActionType.updateLanguagePreference;
  constructor(public payload: { language: Language }) {}
}

export class UpdateDentalNotationPreference implements Action {
  readonly type = SettingsActionType.updateDentalNotationPreference;
  constructor(public payload: { dentalNotation: DentalNotation }) {}
}

export class UpdatedCaseObjectsSettings implements Action {
  readonly type = SettingsActionType.updatedCaseObjectsSettings;
  constructor(public payload: { caseObjectsSettings: CaseObjectsSettings }) {}
}

export class UpdatedToolsSettings implements Action {
  readonly type = SettingsActionType.updatedToolsSettings;
  constructor(public payload: { toolsSettings: ToolsSettings }) {}
}

export class UpdateDevSettings implements Action {
  readonly type = SettingsActionType.updateDevSettings;
  constructor(public payload: { devSettings: DevSettings }) {}
}

export class ToggleSidebar implements Action {
  readonly type = SettingsActionType.toggleSidebar;
}

export class CloseSidebar implements Action {
  readonly type = SettingsActionType.closeSidebar;
}

export class OpenSidebar implements Action {
  readonly type = SettingsActionType.openSidebar;
}

export class UpdateAllToolboxesSettings implements Action {
  readonly type = SettingsActionType.updateAllToolboxesSettings;
  constructor(public payload: { allToolboxesSettings: AllToolboxesSettings }) {}
}

export class UpdateProfileDetails implements Action {
  readonly type = SettingsActionType.updateProfileDetails;
  constructor(public payload: { profileDetails: ProfileDetails }) {}
}

export class RemoveProfileImage implements Action {
  readonly type = SettingsActionType.removeProfileImage;
}

export class TogglePanelsVisibility implements Action {
  readonly type = SettingsActionType.togglePanelsVisibility;
}

export class RegisterToolRadiusChangeListener implements Action {
  readonly type = SettingsActionType.registerToolRadiusChangeListener;
  constructor(public payload: { callback: ToolRadiusChangeListenerType }) {}
}

export class RegisterToolsSettingsChangeListener implements Action {
  readonly type = SettingsActionType.registerToolsSettingsChangeListener;
  constructor(public payload: { callback: ToolsSettingsChangeListenerType }) {}
}

export class TogglePanelsRepositioning implements Action {
  readonly type = SettingsActionType.togglePanelsRepositioning;
}

export type SettingsAction =
  | LoadSettings
  | SettingsLoaded
  | UpdateDesignParameters
  | UpdateImportFolderPreference
  | UpdateExportFolderPreference
  | UpdateLanguagePreference
  | UpdateDentalNotationPreference
  | UpdatedCaseObjectsSettings
  | UpdatedToolsSettings
  | UpdateDevSettings
  | ToggleSidebar
  | CloseSidebar
  | OpenSidebar
  | UpdateAllToolboxesSettings
  | UpdateProfileDetails
  | RemoveProfileImage
  | TogglePanelsVisibility
  | RegisterToolRadiusChangeListener
  | RegisterToolsSettingsChangeListener
  | TogglePanelsRepositioning;
