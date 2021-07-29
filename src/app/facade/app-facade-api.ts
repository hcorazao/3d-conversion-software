import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { Observable } from 'rxjs';
import { ToolsSettings } from '@app/models/tools-settings.model';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { DesignParameters } from '@app/models/design-parameters.model';
import { UserGroups } from '@app/models/user.model';

export type ToolRadiusChangeListenerType = (toolRadius: number) => void;
export type ToolsSettingsChangeListenerType = (toolsSettings: ToolsSettings) => void;
export interface AppFacadeApi {
  notifyCaseInitiallyLoaded: () => void;
  notifyPreparationMarginEntering: () => void;
  notifyPreparationMarginEntered: () => void;
  notifyPreparationMarginEditing: () => void;
  notifyPreparationMarginEdited: () => void;
  notifyCopyLineActivated: () => void;
  notifyCopyLineDeactivated: () => void;
  exportToExportFolder: (file: File) => void;
  exportToCaseFolderLocation: (file: File) => void;
  updateCaseObjectsSettings: (caseObjectsSettings: CaseObjectsSettings) => void;
  importCaseAdditionalFile: (fileName: string) => Observable<File>;
  getToolsSettings: () => ToolsSettings;
  updateToolsSettings: (toolsSettings: ToolsSettings) => void;
  getLoadedDentalCaseFolder: () => DentalCaseFolder;
  getDesignParamaters: () => DesignParameters;
  configureUndoRedoButtons: (undoCallback: () => void, redoCallback: () => void) => void;
  setUndoButtonEnability: (enabled: boolean) => void;
  setRedoButtonEnability: (enabled: boolean) => void;
  registerToolRadiusChangeListener: (callback: ToolRadiusChangeListenerType) => void;
  registerToolsSettingsChangeListener: (callback: ToolsSettingsChangeListenerType) => void;
  toggleCadAssistantExportDisabled: (disabled: boolean) => void;
  getUserGroups: () => UserGroups;
}
