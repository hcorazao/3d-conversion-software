import { ProfileDetails } from '@app/models/profile-details.model';
import { DesignParameters } from '@app/models/design-parameters.model';
import { ProfilePreferences } from '@app/models/profile-preferences.model';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { ToolsSettings } from '@app/models/tools-settings.model';
import { DevSettings } from '@app/models/dev-settings.model';
import { AllToolboxesSettings } from '@app/models/all-toolboxes-settings.model';

export interface SettingsState {
  profileDetails: ProfileDetails;
  designParameters: DesignParameters;
  profilePreferences: ProfilePreferences;
  caseObjectsSettings: CaseObjectsSettings;
  toolsSettings: ToolsSettings;
  devSettings: DevSettings;
  sidebarOpen: boolean;
  allToolboxesSettings: AllToolboxesSettings;
  toolRadiusChangeCallback: (toolRadius: number) => void;
  toolsSettingsChangeCallback: (toolsSettings: ToolsSettings) => void;
  panelsRepositioning: boolean;
}
