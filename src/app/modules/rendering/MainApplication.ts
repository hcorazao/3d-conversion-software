import ViewApi from './ViewApi';

import { SceneLoader, Scene, ArcRotateCamera, Vector3, Color3, DirectionalLight, Color4 } from '@babylonjs/core';

import { OBJFileLoader } from '@babylonjs/loaders';
import SceneManager from './core/SceneManager';
import CameraManager from './core/CameraManager';
import Graphics from './core/Graphics';

import CRSceneObjectsManager from './components/SceneObjectsManager';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import ProjectManager from './components/ProjectManagement/ProjectManager';
import { AppFacadeApi } from '@app/facade/app-facade-api';

import StateFactory from './workflows/states/StateFactory';
import { StateEnum } from './workflows/states/StateEnum';
import TransitionFactory from './workflows/transitions/TransitionFactory';
import { ToolsSettings } from '@app/models/tools-settings.model';
import SceneObjectsManager from './components/SceneObjectsManager';
import SceneMinimalThicknessObject from './components/SceneMinimalThicknessObject';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';

import { PlyFileLoader } from './components/VendorLoaders/PlyFileLoader';
import { DesignParameters } from '@app/models/design-parameters.model';
import { TransitionEnum } from './workflows/transitions/TransitionEnum';
import SceneFormToolManager from './components/Tools/SceneFormToolManager';
import SceneAppearance from './components/Tools/SceneAppearance';

/**
 * This is the main component that sets up the scene and all the other elements that are going to
 * be used by the 3d component. It supposes that there's canvas ready
 */
export default class MainApplication {
  private projectManager: ProjectManager;
  private objectManager: CRSceneObjectsManager;

  // constructor(canvas: HTMLCanvasElement, appFacadeApi: AppFacadeApi) {
  constructor(canvasElement: string, private appFacadeApi: AppFacadeApi) {
    // set the external facadeApi to the ViewApi singleton
    ViewApi.getInstance().setExternalAPI(appFacadeApi);

    const canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    Graphics.getInstance().init(canvas);

    OBJFileLoader.IMPORT_VERTEX_COLORS = true;
    if (SceneLoader) {
      SceneLoader.RegisterPlugin(new PlyFileLoader());
    }

    // Increase double click delay (default: 300ms)
    // Scene.DoubleClickDelay = 300;
  }

  /**
   * Creates the BABYLONJS Scene
   */
  createScene(): void {
    // creating the scene
    const scene = new Scene(Graphics.getInstance().engine);
    const sceneDebug = new Scene(Graphics.getInstance().engine);
    //
    SceneManager.getInstance().current = scene;
    SceneManager.getInstance().currentDebug = sceneDebug;
    //
    scene.useRightHandedSystem = false; // flip this to false to fix material
    sceneDebug.useRightHandedSystem = false; // flip this to false to fix material

    scene.clearColor = new Color4(0, 0, 0, 0);
    sceneDebug.autoClear = false;
    //
    const camera = new ArcRotateCamera('main_camera', Math.PI / 2, Math.PI / 2, 100, Vector3.Zero(), SceneManager.getInstance().current);
    const cameraDebug = new ArcRotateCamera(
      'debug_camera',
      Math.PI / 2,
      Math.PI / 2,
      100,
      Vector3.Zero(),
      SceneManager.getInstance().currentDebug
    );
    //
    CameraManager.getInstance().current = camera;
    CameraManager.getInstance().currentDebug = cameraDebug;

    camera.attachControl(true);
    cameraDebug.attachControl(true);

    // Mouse wheel speed
    camera.wheelPrecision = 20.0;
    cameraDebug.wheelPrecision = 20.0;

    // no rotation constraints
    camera.lowerBetaLimit = null;
    camera.upperBetaLimit = null;
    cameraDebug.lowerBetaLimit = null;
    cameraDebug.upperBetaLimit = null;

    camera.lowerRadiusLimit = 10; // smallest dist you can look from
    camera.upperRadiusLimit = 150; // highest dist you can look from
    cameraDebug.lowerRadiusLimit = 10; // smallest dist you can look from
    cameraDebug.upperRadiusLimit = 150; // highest dist you can look from

    camera.updateUpVectorFromRotation = true;
    cameraDebug.updateUpVectorFromRotation = true;

    this.objectManager = CRSceneObjectsManager.GetInstance();
    this.objectManager.appFacadeApi = this.appFacadeApi;

    this.projectManager = new ProjectManager(this.objectManager);

    TransitionFactory.GetInstance(this.appFacadeApi).stateFactory = StateFactory.GetInstance(this.appFacadeApi);
    StateFactory.GetInstance(this.appFacadeApi).transitionFactory = TransitionFactory.GetInstance(this.appFacadeApi);

    SceneAppearance.addLightingToScene(SceneManager.getInstance().current, camera);
  }

  /**
   * Starts the animation loop.
   */
  start(): boolean {
    SceneManager.getInstance().current.registerBeforeRender(() => {});

    // run the render loop
    Graphics.getInstance().engine.runRenderLoop(() => {
      SceneManager.getInstance().current.render();
      SceneManager.getInstance().currentDebug.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
      this.resize();
    });

    return true;
  }

  resize() {
    Graphics.getInstance().engine.resize();
  }

  on_pre_render(): void {}

  on_post_render(): void {}

  update(): void {}

  stop(): void {
    Graphics.getInstance().engine.stopRenderLoop();
  }

  startImport(): boolean {
    console.log('Babylon - enter step 1 - Import');
    return this.restartCase();
  }

  startPreparationMargin(): boolean {
    return TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.EnterPreparationMargin);
  }

  startEditMargin(): boolean {
    return TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.PreparationMarginEntered);
  }

  stopEditMargin(): boolean {
    console.log('Edit margin line tool stopped');
    return true;
  }

  startInsertionAxis(): boolean {
    if (TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.CreateInsertionAxis) !== false) {
      SceneObjectsManager.GetInstance().getInsertionAxisEffect().turnOn();
      return TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.InsertionAxisCreated);
    }
    return false;
  }

  startCopyLine(): boolean {
    if (TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.CreateCopyLine) !== false) {
      SceneObjectsManager.GetInstance().getInsertionAxisEffect().turnOff();
      return TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.CopyLineCreated);
    }
    return false;
  }

  startEditCopyLine(): boolean {
    console.log('Babylon - step 4 - Edit CopyLine');
    return true;
  }

  stopEditCopyLine(): boolean {
    return true;
  }

  startContactAndThickness(): boolean {
    if (TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.CreateCopyRestoration) !== false) {
      return TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.CopyRestorationCreated);
    }
    return false;
  }

  startRestoreAdjustMesialContact(): boolean {
    console.log('Babylon - step 5.1 - Restore - Adjust Mesial Contact');
    TransitionFactory.GetInstance(this.appFacadeApi).getTransition(TransitionEnum.Adjust2MesialContact).execute();
    return true;
  }

  startRestoreAdjustDistalContact(): boolean {
    console.log('Babylon - step 5.2 - Restore - Adjust Distal Contact');
    TransitionFactory.GetInstance(this.appFacadeApi).getTransition(TransitionEnum.Adjust2DistalContact).execute();
    return true;
  }

  startRestoreAdjustOcclusalContact(): boolean {
    console.log('Babylon - step 5.3 - Restore - Adjust Occlusal Contact');
    TransitionFactory.GetInstance(this.appFacadeApi).getTransition(TransitionEnum.Adjust2OcclusalContact).execute();
    return true;
  }

  prepareResultExport(type?): boolean {
    console.log('Babylon - prepare export');
    // this.projectManager.export('example', type);
    this.projectManager.exportCrown();
    return true;
  }

  updateCaseObjectsSettings(options: CaseObjectsSettings): void {
    this.projectManager.updateCaseObjectsSettings(options);
  }

  updateDevSettings(devSettings) {
    console.log('Babylon - update dev settings', devSettings);
    this.projectManager.updateDevSettings(devSettings);
  }

  loadFromCaseFolder(dentalCaseFolder: DentalCaseFolder): boolean {
    if (dentalCaseFolder.dentalCase.preparationJaw === 'LOWER') {
      this.objectManager.setPreparation(this.objectManager.JawType.LowerJaw);
    }
    if (dentalCaseFolder.dentalCase.preparationJaw === 'UPPER') {
      this.objectManager.setPreparation(this.objectManager.JawType.UpperJaw);
    }
    this.objectManager.caseName = dentalCaseFolder.dentalCase.name;

    // set the preparation tooth number
    this.objectManager.preparationToothNumber = +dentalCaseFolder.dentalCase.preparationToothNumber;

    const files: File[] = dentalCaseFolder.caseFiles.map((caseFile) => caseFile.file);
    this.projectManager.loadFromFileArray(files);

    return TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.PreparationImported);
  }

  restartCase(): boolean {
    if (StateFactory.GetInstance(this.appFacadeApi).getActiveState()) {
      if (StateFactory.GetInstance(this.appFacadeApi).getActiveState().isState(StateEnum.AppStarted)) {
        return true;
      }
      return TransitionFactory.GetInstance(this.appFacadeApi).gotoState(StateEnum.AppStarted) === true;
    } else {
      return StateFactory.GetInstance(this.appFacadeApi).getState(StateEnum.AppStarted).onEnter();
    }
  }

  exitPreparationMargin(): void {
    console.log('Babylon - exit step 2 - PreparationMargin');
  }

  exitInsertionAxis() {
    console.log('Babylon - exit step 3 - InsertionAxis');
  }

  exitCopyLine() {
    console.log('Babylon - exit step 4 - CopyLine');
  }

  exitContactAndThickness() {
    console.log('Babylon - exit step 5 - ContactAndThickness');
  }

  resetCamera() {
    if (!this.objectManager.resetCameraToCenterOfPrepMargin()) {
      this.objectManager.resetCameraPreparation();
    }
  }

  public updateToolsSettings(toolsSettings: ToolsSettings) {
    console.log('Babylon - updateToolsSettings', toolsSettings);
    const toothNb = SceneObjectsManager.GetInstance().preparationToothNumber;
    const minThickness = SceneObjectsManager.GetInstance().getMinimalThickness(toothNb);
    if (minThickness) {
      toolsSettings.minimalThickness ? (minThickness.visibility = SceneMinimalThicknessObject.VISIBILITY) : (minThickness.visibility = 0);
    }

    SceneFormToolManager.GetInstance(this.appFacadeApi).setActiveTool(toolsSettings.form);

    this.objectManager.getDistanceCalculator().setMapVisibility(toolsSettings.occlusalDistance, toolsSettings.proximalDistance);
  }

  public updateDesignParameters(designParameters: DesignParameters) {
    // TODO: remove console.log after using this function
    console.log('Babylon - update design parameters', designParameters);
  }

  public isTransitionAvailable(transition: TransitionEnum): boolean {
    const evaluation = TransitionFactory.GetInstance(this.appFacadeApi).getTransition(transition).evaluate();
    console.log('isTransitionAvailable', transition, evaluation);
    return evaluation;
  }

  public makeTransition(transition: TransitionEnum): boolean {
    console.log('makeTransition', transition);
    if (this.isTransitionAvailable(transition)) {
      return TransitionFactory.GetInstance(this.appFacadeApi).getTransition(transition).execute();
    } else {
      console.error(`[Babylon] tried to make illegal transition ${transition}`);
      return false;
    }
  }
  /**
   * called after using "Babylon Debug Call" button in DevTools
   * used for example for enforcing Babylon to call some Angular methods for development or debug purposes
   */
  public debugFromAngular() {
    // MG had to comment the next line due to lint complaining: ERROR: 323:5  no-console  Calls to 'console.info' are not allowed.
    // disabled by pre-commit
    // console.info('groups assigned to user', this.appFacadeApi.getUserGroups());
  }
}
