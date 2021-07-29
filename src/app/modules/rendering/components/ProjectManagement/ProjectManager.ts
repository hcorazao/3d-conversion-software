import ProjectLoader from './ProjectLoader';
import ProjectExporter, { FileTypeEnum } from './ProjectExporter';
import ProjectObjects from './../ProjectManagement/ProjectObjects';
import CRSceneObjectsManager from './../SceneObjectsManager';

import ViewApi from './../../ViewApi';
/**
 * ProjectManager is the class that coordinate the business logic
 * it keeps track of the 3d objects that are being in the scene and the user information
 *
 */

export default class ProjectManager {
  private projectInfo: object;
  private projectObjects: ProjectObjects;
  private projectLoader: ProjectLoader;
  private projectExporter: ProjectExporter;
  private objectManager: CRSceneObjectsManager;
  public onLoad = () => {};

  constructor(sceneObjectManager) {
    //
    this.projectLoader = new ProjectLoader();
    this.projectExporter = new ProjectExporter();
    this.objectManager = sceneObjectManager;
    this.projectObjects = new ProjectObjects(this.objectManager, this);
  }

  loadFromURL(URL) {
    // this.jaw = new DebugSceneJawObject('./assets/mesh/obj.obj');
    // (this.jaw as DebugSceneJawObject).debugCalculateBorderHoles();
    // this.projectLoader.loadFromURL(
    //  URL,
    //  this.projectObjects);
  }

  loadingReady() {
    this.onLoad();
    // ViewApi.getInstance().API.notifyCaseInitiallyLoaded();
  }

  loadFromFileArray(arrayOfFiles) {
    this.projectLoader.loadFromFileArray(arrayOfFiles, this.projectObjects);
  }

  export(name, type) {
    //  this.projectExporter.export(name, type, this.projectObjects.asArray());
  }

  exportCrown() {
    this.projectExporter.export(
      this.objectManager.caseName + '-' + this.objectManager.preparationToothNumber + '-Restoration',
      FileTypeEnum.OBJ,
      [this.objectManager.restorations[this.objectManager.preparationToothNumber].getMesh()]
    );

    this.projectExporter.export(
      this.objectManager.caseName + '-' + this.objectManager.preparationToothNumber + '-Restoration',
      FileTypeEnum.STL,
      [this.objectManager.restorations[this.objectManager.preparationToothNumber].getMesh()]
    );
  }

  updateCaseObjectsSettings(options) {
    this.projectObjects.updateCaseObjectsSettings(options);
  }

  updateDevSettings(devSettings) {
    this.projectObjects.updateDevSettings(devSettings);
  }
}
