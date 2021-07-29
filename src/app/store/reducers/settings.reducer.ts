import { SettingsAction, SettingsActionType } from './../actions';
import { SettingsState } from '@app/store/states';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { ToolsSettings } from '@app/models/tools-settings.model';
import { DevSettings } from '@app/models/dev-settings.model';
import { AllToolboxesSettings } from '@app/models/all-toolboxes-settings.model';
import { ProfileDetails } from '@app/models/profile-details.model';
import { DentalNotation } from '@app/models/enums/jaw.enum';

export const initialState: SettingsState = {
  profileDetails: {},
  designParameters: {},
  profilePreferences: {
    dentalNotation: DentalNotation.ISO_3950,
  },
  caseObjectsSettings: null,
  toolsSettings: new ToolsSettings(),
  devSettings: new DevSettings(),
  sidebarOpen: false,
  allToolboxesSettings: AllToolboxesSettings.createWithDefaultValues(),
  toolRadiusChangeCallback: undefined,
  toolsSettingsChangeCallback: undefined,
  panelsRepositioning: false,
};

export function reducer(previousState = initialState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case SettingsActionType.loadSettings:
      return previousState;
    case SettingsActionType.settingsLoaded:
      return {
        profileDetails: action.payload.profileDetails,
        designParameters: action.payload.designParameters,
        profilePreferences: action.payload.profilePreferences,
        caseObjectsSettings: null,
        toolsSettings: action.payload.toolsSettings,
        devSettings: new DevSettings(),
        sidebarOpen: action.payload.sidebarOpen,
        allToolboxesSettings: action.payload.allToolboxesSettings,
        toolRadiusChangeCallback: undefined,
        toolsSettingsChangeCallback: undefined,
        panelsRepositioning: false,
      };
    case SettingsActionType.updateDesignParameters:
      return {
        ...previousState,
        designParameters: action.payload.designParameters,
      };
    case SettingsActionType.updateImportFolderPreference:
      return {
        ...previousState,
        profilePreferences: {
          ...previousState.profilePreferences,
          importFolder: action.payload.importFolder,
        },
      };
    case SettingsActionType.updateExportFolderPreference:
      return {
        ...previousState,
        profilePreferences: {
          ...previousState.profilePreferences,
          exportFolder: action.payload.exportFolder,
        },
      };
    case SettingsActionType.updateLanguagePreference:
      return {
        ...previousState,
        profilePreferences: {
          ...previousState.profilePreferences,
          language: action.payload.language,
        },
      };
    case SettingsActionType.updateDentalNotationPreference:
      return {
        ...previousState,
        profilePreferences: {
          ...previousState.profilePreferences,
          dentalNotation: action.payload.dentalNotation,
        },
      };
    case SettingsActionType.updatedCaseObjectsSettings:
      return {
        ...previousState,
        caseObjectsSettings: CaseObjectsSettings.createByUpdating(previousState.caseObjectsSettings, action.payload.caseObjectsSettings),
      };
    case SettingsActionType.updatedToolsSettings:
      return {
        ...previousState,
        toolsSettings: ToolsSettings.createByUpdating(previousState.toolsSettings, action.payload.toolsSettings),
      };
    case SettingsActionType.updateDevSettings:
      return {
        ...previousState,
        devSettings: action.payload.devSettings,
      };
    case SettingsActionType.toggleSidebar:
      return {
        ...previousState,
        sidebarOpen: !previousState.sidebarOpen,
      };
    case SettingsActionType.closeSidebar:
      return {
        ...previousState,
        sidebarOpen: false,
      };
    case SettingsActionType.openSidebar:
      return {
        ...previousState,
        sidebarOpen: true,
      };
    case SettingsActionType.updateAllToolboxesSettings:
      return {
        ...previousState,
        allToolboxesSettings: AllToolboxesSettings.createByUpdating(
          previousState.allToolboxesSettings,
          action.payload.allToolboxesSettings
        ),
      };
    case SettingsActionType.updateProfileDetails:
      return {
        ...previousState,
        profileDetails: ProfileDetails.createByUpdating(previousState.profileDetails, action.payload.profileDetails),
      };
    case SettingsActionType.removeProfileImage:
      return {
        ...previousState,
        profileDetails: {
          ...previousState.profileDetails,
          profileImage: null,
        },
      };
    case SettingsActionType.togglePanelsVisibility:
      const toolboxesSettingsUpdate = new AllToolboxesSettings();
      toolboxesSettingsUpdate.panelsVisible = !previousState.allToolboxesSettings.panelsVisible;
      return {
        ...previousState,
        allToolboxesSettings: AllToolboxesSettings.createByUpdating(previousState.allToolboxesSettings, toolboxesSettingsUpdate),
      };
    case SettingsActionType.registerToolRadiusChangeListener: {
      return {
        ...previousState,
        toolRadiusChangeCallback: action.payload.callback,
      };
    }
    case SettingsActionType.registerToolsSettingsChangeListener: {
      return {
        ...previousState,
        toolsSettingsChangeCallback: action.payload.callback,
      };
    }
    case SettingsActionType.togglePanelsRepositioning:
      return {
        ...previousState,
        panelsRepositioning: !previousState.panelsRepositioning,
      };

    default:
      return previousState;
  }
}
