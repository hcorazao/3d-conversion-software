import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

export default class Adjust2OcclusalContactTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(
      TransitionEnum.Adjust2OcclusalContact,
      StateEnum.CopyRestorationCreated,
      StateEnum.CopyRestorationCreated,
      appFacadeApi,
      stateFactory
    );
  }

  protected _execute(): boolean {
    this.objectManager.setJawVisibilityExclusively(this.objectManager.isPreparation);
    this.objectManager.resetCameraToCenterOfPrepMargin();
    return true;
  }

  protected _evaluate(): boolean {
    return true;
  }
}
