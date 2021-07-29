import { AppFacadeApi } from '@app/facade/app-facade-api';
import SceneObjectsManager from '@app/modules/rendering/components/SceneObjectsManager';
import SceneEditCopylineTool from '@app/modules/rendering/components/Tools/SceneEditCopylineTool';
import ITransitionFactory from '../../transitions/ITransitionFactory';
import { TransitionEnum } from '../../transitions/TransitionEnum';
import State from '../State';
import { StateEnum } from '../StateEnum';

export default class CopyLineCreatedState extends State {
  private editCopyLineTool: SceneEditCopylineTool;

  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.CopyLineCreated, appFacadeApi, transitionFactory, [
      TransitionEnum.CopyLine2CreateCopyRestoration,
      TransitionEnum.CopyLine2AppStarted,
      TransitionEnum.CopyLine2PrepMargin,
      TransitionEnum.CopyLine2InsertionAxis,
      TransitionEnum.CopyLine2CopyRestoration,
      TransitionEnum.CopyLine2ExportRestoration,
    ]);

    this.editCopyLineTool = new SceneEditCopylineTool(
      SceneObjectsManager.GetInstance().preparationToothNumber,
      SceneObjectsManager.GetInstance()
    );
    this.editCopyLineTool.setActiveCallbacks(
      () => {
        this.appFacadeApi.notifyCopyLineActivated();
      },
      () => {
        this.appFacadeApi.notifyCopyLineDeactivated();
      }
    );
  }

  protected _onEnter(): boolean {
    this.objectManager.setJawPickedExclusively(this.objectManager.isPreparation + 1);
    this.objectManager.setJawVisibilityExclusively(this.objectManager.isPreparation + 1);

    this.editCopyLineTool.StartTool();
    return true;
  }

  protected _onExit(): boolean {
    this.editCopyLineTool.StopTool();
    return true;
  }
}
