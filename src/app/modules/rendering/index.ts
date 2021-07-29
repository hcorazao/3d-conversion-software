import MainApplication from './MainApplication';
import { AppFacadeApi } from '@app/facade/app-facade-api';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { DevSettings } from '@app/models/dev-settings.model';
import { ToolsSettings } from '@app/models/tools-settings.model';
import { DesignParameters } from '@app/models/design-parameters.model';
import { TransitionEnum } from './workflows/transitions/TransitionEnum';

/**
 * This is the App entry point. It sets up the main app and call the start function
 */

let mainApp: MainApplication;

export const initializeBabylonMainApplication = (canvasElementId: string, appFacadeApi: AppFacadeApi) => {
  mainApp = new MainApplication(canvasElementId, appFacadeApi);
  mainApp.createScene();
  mainApp.start();
  mainApp.startImport();
};

export const babylonApi = {
  resize: () => mainApp.resize(),
  fileRendering: (dentalCaseFolder: DentalCaseFolder) => mainApp.loadFromCaseFolder(dentalCaseFolder),
  exitPreparationMargin: () => mainApp.exitPreparationMargin(),
  exitInsertionAxis: () => mainApp.exitInsertionAxis(),
  exitCopyLine: () => mainApp.exitCopyLine(),
  exitContactAndThickness: () => mainApp.exitContactAndThickness(),
  startImport: () => mainApp.startImport(),
  startPreparationMargin: () => mainApp.startPreparationMargin(),
  startEditMargin: () => mainApp.startEditMargin(),
  startInsertionAxis: () => mainApp.startInsertionAxis(),
  startCopyLine: () => mainApp.startCopyLine(),
  startContactAndThickness: () => mainApp.startContactAndThickness(),
  startRestoreAdjustMesialContact: () => mainApp.startRestoreAdjustMesialContact(),
  startRestoreAdjustDistalContact: () => mainApp.startRestoreAdjustDistalContact(),
  startRestoreAdjustOcclusalContact: () => mainApp.startRestoreAdjustOcclusalContact(),
  prepareResultExport: () => mainApp.prepareResultExport(),
  updateCaseObjectsSettings: (caseObjectsSettings: CaseObjectsSettings) => mainApp.updateCaseObjectsSettings(caseObjectsSettings),
  restartCase: () => mainApp.restartCase(),
  updateDevSettings: (devSettings: DevSettings) => mainApp.updateDevSettings(devSettings),
  stopEditPreparationMargin: () => mainApp.stopEditMargin(),
  stopEditCopyLine: () => mainApp.stopEditCopyLine(),
  resetCamera: () => mainApp.resetCamera(),
  updateToolsSettings: (toolsSettings: ToolsSettings) => mainApp.updateToolsSettings(toolsSettings),
  updateDesignParameters: (designParameters: DesignParameters) => mainApp.updateDesignParameters(designParameters),
  debug: () => mainApp.debugFromAngular(),
  isTransitionAvailable: (transition: TransitionEnum) => mainApp.isTransitionAvailable(transition),
  makeTransition: (transition: TransitionEnum) => mainApp.makeTransition(transition),
};
