import { AppFacadeApi } from '@app/facade/app-facade-api';
import { FormToolEnum } from '@app/models/enums/tool-form';
import SceneObjectsManager from '@app/modules/rendering/components/SceneObjectsManager';
import SceneFormToolManager from '@app/modules/rendering/components/Tools/SceneFormToolManager';
import CameraManager from '@app/modules/rendering/core/CameraManager';
import { Vector3 } from '@babylonjs/core';
import ITransitionFactory from '../../transitions/ITransitionFactory';
import { TransitionEnum } from '../../transitions/TransitionEnum';
import State from '../State';
import { StateEnum } from '../StateEnum';

export default class CopyRestorationCreatedState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.CopyRestorationCreated, appFacadeApi, transitionFactory, [
      TransitionEnum.Adjust2MesialContact,
      TransitionEnum.Adjust2DistalContact,
      TransitionEnum.Adjust2OcclusalContact,
      TransitionEnum.CopyRestoration2ExportRestoration,
      TransitionEnum.CopyRestoration2AppStarted,
      TransitionEnum.CopyRestoration2PrepMargin,
      TransitionEnum.CopyRestoration2InsertionAxis,
      TransitionEnum.CopyRestoration2CopyLine,
    ]);
  }

  protected _onEnter(): boolean {
    SceneObjectsManager.GetInstance().setJawPickedExclusively(SceneObjectsManager.JawType.Unknown);

    this.objectManager.setRestorationVisibility(1);
    this.objectManager.setRestorationPickability(true);

    // initialize CAD tool
    SceneFormToolManager.GetInstance(this.appFacadeApi).setActiveTool(this.appFacadeApi.getToolsSettings().form);

    return true;
  }

  protected _onExit(): boolean {
    this.objectManager.setRestorationVisibility(0);
    this.objectManager.setRestorationPickability(false);

    // de-initialize CAD tool
    SceneFormToolManager.GetInstance(this.appFacadeApi).setActiveTool(FormToolEnum.NONE);

    return true;
  }
}
