import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SettingsState, AuthState } from '../states';
import { getAuthStore } from './auth.selectors';

export const getSettingsStore = createFeatureSelector('settings');

export const getDesignParameters = createSelector(getSettingsStore, (settingsState: SettingsState) => settingsState.designParameters);

export const getProfilePreferences = createSelector(getSettingsStore, (settingsState: SettingsState) => settingsState.profilePreferences);

export const getCaseObjectsSettings = createSelector(getSettingsStore, (settingsState: SettingsState) => settingsState.caseObjectsSettings);

export const getToolsSettings = createSelector(getSettingsStore, (settingsState: SettingsState) => {
  return settingsState.toolsSettings;
});

export const getDevSettings = createSelector(getSettingsStore, (settingsState: SettingsState) => settingsState.devSettings);

export const isSidebarOpen = createSelector(getSettingsStore, (settingsState: SettingsState) => settingsState.sidebarOpen);

export const getAllToolboxesSettings = createSelector(
  getSettingsStore,
  (settingsState: SettingsState) => settingsState.allToolboxesSettings
);

export const getProfileImage = createSelector(
  getSettingsStore,
  (settingsState: SettingsState) => settingsState.profileDetails.profileImage
);

export const getProfileDetails = createSelector(getSettingsStore, (settingsState: SettingsState) => settingsState.profileDetails);

export const isDevUIActive = createSelector(
  getSettingsStore,
  getAuthStore,
  (settingsState: SettingsState, authState: AuthState) => settingsState.devSettings.devUI && authState.userPermissions.devToolsUsage
);

export const arePanelsVisible = createSelector(
  getSettingsStore,
  (settingsState: SettingsState) => settingsState.allToolboxesSettings.panelsVisible
);

export const getToolRadiusChangeCallback = createSelector(
  getSettingsStore,
  (settingsState: SettingsState) => settingsState.toolRadiusChangeCallback
);

export const getToolsSettingsChangeCallback = createSelector(
  getSettingsStore,
  (settingsState: SettingsState) => settingsState.toolsSettingsChangeCallback
);

export const isPanelsRepositioningActive = createSelector(
  getSettingsStore,
  (settingsState: SettingsState) => settingsState.panelsRepositioning
);
