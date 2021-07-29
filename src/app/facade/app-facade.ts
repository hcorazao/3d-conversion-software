import { AppFacadeApi } from './app-facade-api';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { Observable } from 'rxjs';
import { ToolsSettings } from '@app/models/tools-settings.model';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { DesignParameters } from '@app/models/design-parameters.model';
import { UserGroups } from '@app/models/user.model';

export class AppFacade implements AppFacadeApi {
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
  registerToolRadiusChangeListener: (callback: (toolRadius: number) => void) => void;
  registerToolsSettingsChangeListener: (callback: (toolsSettings: ToolsSettings) => void) => void;
  toggleCadAssistantExportDisabled: (disabled: boolean) => void;
  getUserGroups: () => UserGroups;

  constructor(implementations: AppFacadeApi) {
    this.notifyCaseInitiallyLoaded = implementations.notifyCaseInitiallyLoaded;
    this.notifyPreparationMarginEntering = implementations.notifyPreparationMarginEntering;
    this.notifyPreparationMarginEntered = implementations.notifyPreparationMarginEntered;
    this.notifyPreparationMarginEditing = implementations.notifyPreparationMarginEditing;
    this.notifyPreparationMarginEdited = implementations.notifyPreparationMarginEdited;
    this.notifyCopyLineActivated = implementations.notifyCopyLineActivated;
    this.notifyCopyLineDeactivated = implementations.notifyCopyLineDeactivated;
    this.exportToExportFolder = implementations.exportToExportFolder;
    this.exportToCaseFolderLocation = implementations.exportToCaseFolderLocation;
    this.updateCaseObjectsSettings = implementations.updateCaseObjectsSettings;
    this.importCaseAdditionalFile = implementations.importCaseAdditionalFile;
    this.getToolsSettings = implementations.getToolsSettings;
    this.updateToolsSettings = implementations.updateToolsSettings;
    this.getLoadedDentalCaseFolder = implementations.getLoadedDentalCaseFolder;
    this.getDesignParamaters = implementations.getDesignParamaters;
    this.configureUndoRedoButtons = implementations.configureUndoRedoButtons;
    this.setUndoButtonEnability = implementations.setUndoButtonEnability;
    this.setRedoButtonEnability = implementations.setRedoButtonEnability;
    this.registerToolRadiusChangeListener = implementations.registerToolRadiusChangeListener;
    this.registerToolsSettingsChangeListener = implementations.registerToolsSettingsChangeListener;
    this.toggleCadAssistantExportDisabled = implementations.toggleCadAssistantExportDisabled;
    this.getUserGroups = implementations.getUserGroups;
  }
}
