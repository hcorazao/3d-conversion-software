import { AppFacadeApi } from '@app/facade/app-facade-api';
import SceneObjectsManager from '@app/modules/rendering/components/SceneObjectsManager';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

export default class Adjust2DistalContactTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(
      TransitionEnum.Adjust2DistalContact,
      StateEnum.CopyRestorationCreated,
      StateEnum.CopyRestorationCreated,
      appFacadeApi,
      stateFactory
    );
  }

  protected _execute(): boolean {
    this.objectManager.setJawVisibilityExclusively(SceneObjectsManager.JawType.Unknown);
    this.objectManager.setCameraToCenterOfPrepMarginFromDistal();
    return true;
  }

  protected _evaluate(): boolean {
    return true;
  }
}
