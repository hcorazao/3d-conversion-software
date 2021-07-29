import State from './State';
import { AppFacadeApi } from '@app/facade/app-facade-api';
import SceneObjectsManager from '../../components/SceneObjectsManager';
import { StateEnum } from './StateEnum';
import SceneAddMarginTool from '../../components/Tools/SceneAddMarginTool';
import { TransitionEnum } from '../transitions/TransitionEnum';
import ITransitionFactory from '../transitions/ITransitionFactory';

export default class EnterPreparationMarginState extends State {
  protected addLineTool: SceneAddMarginTool;

  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.EnterPreparationMargin, appFacadeApi, transitionFactory, [
      TransitionEnum.Enter2EnteredMargin,
      TransitionEnum.EnterPrepMargin2AppStarted,
    ]);
  }

  private initializeTool() {
    this.addLineTool = new SceneAddMarginTool(SceneObjectsManager.GetInstance());
    this.addLineTool.setUndoRedoCallbacks();

    this.addLineTool.setActiveCallbacks(
      () => {
        this.appFacadeApi.setUndoButtonEnability(true);
        // this.appFacadeApi.setRedoButtonEnability(true); NOT IMPLEMENTED YET
      },
      () => {
        // wait a bit so that the click event is no longer active, and then start editing
        setTimeout(() => {
          this.appFacadeApi.notifyPreparationMarginEntered();
          this.appFacadeApi.setUndoButtonEnability(false);
          // this.appFacadeApi.setRedoButtonEnability(false); NOT IMPLEMENTED YET
        }, 200);
      }
    );
  }

  protected _onEnter(): boolean {
    this.initializeTool();

    SceneObjectsManager.GetInstance().setJawPickedExclusively(SceneObjectsManager.GetInstance().isPreparation);
    SceneObjectsManager.GetInstance().setJawVisibilityExclusively(SceneObjectsManager.GetInstance().isPreparation);
    SceneObjectsManager.GetInstance().resetCameraPreparation();

    if (
      !this.objectManager
        .getMargin(this.objectManager.preparationToothNumber)
        .import(this.appFacadeApi.getLoadedDentalCaseFolder().vectorsArrays.marginVectorsArray)
    ) {
      this.addLineTool.StartTool();
    } else {
      this.appFacadeApi.notifyPreparationMarginEntered();
    }

    return true;
  }

  protected _onExit(): boolean {
    this.addLineTool.StopTool();

    // enable next button
    // this.appFacadeApi.notifyPreparationMarginEntered();

    return true;
  }
}
