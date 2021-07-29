import State from './State';
import { AppFacadeApi } from '@app/facade/app-facade-api';
import SceneEditMarginTool from '../../components/Tools/SceneEditMarginTool';
import CRSceneSerializer from '../../components/SceneSerializer';
import { StateEnum } from './StateEnum';
import { TransitionEnum } from '../transitions/TransitionEnum';
import ITransitionFactory from '../transitions/ITransitionFactory';

export default class PreparationMarginEnteredState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.PreparationMarginEntered, appFacadeApi, transitionFactory, [
      TransitionEnum.Entered2EnterMargin,
      TransitionEnum.PrepMargin2CreateInsertionAxis,
      TransitionEnum.PrepMarginEntered2AppStarted,
      TransitionEnum.PrepMargin2InsertionAxis,
      TransitionEnum.PrepMargin2CopyLine,
      TransitionEnum.PrepMargin2CopyRestoration,
      TransitionEnum.PrepMargin2ExportRestoration,
    ]);
  }

  protected initializeTool() {
    this.objectManager.editMarginLineTool = new SceneEditMarginTool(this.objectManager.preparationToothNumber, this.objectManager);
    this.objectManager.editMarginLineTool.setUndoRedoCallbacks();
    this.objectManager.editMarginLineTool.setActiveCallbacks(
      () => {
        this.appFacadeApi.notifyPreparationMarginEditing();
        this.appFacadeApi.setUndoButtonEnability(true);
        // this.appFacadeApi.setRedoButtonEnability(true); NOT IMPLEMENTED YET
      },
      () => {
        this.appFacadeApi.notifyPreparationMarginEdited();
        this.appFacadeApi.setUndoButtonEnability(false);
        // this.appFacadeApi.setRedoButtonEnability(false); NOT IMPLEMENTED YET
      }
    );
  }

  protected _onEnter(): boolean {
    this.objectManager.setJawVisibility(this.objectManager.isPreparation);
    this.objectManager.setJawPickedExclusively(this.objectManager.isPreparation);

    this.initializeTool();

    this.objectManager.editMarginLineTool.StartTool();

    // CRSceneSerializer.ExportScene(this.objectManager, this.appFacadeApi);

    return true;
  }

  protected _onExit(): boolean {
    this.objectManager.editMarginLineTool.StopTool();
    return true;
  }
}
