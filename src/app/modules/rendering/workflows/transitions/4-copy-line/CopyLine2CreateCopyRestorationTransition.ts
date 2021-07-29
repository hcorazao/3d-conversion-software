import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

export default class CopyLine2CreateCopyRestorationTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(
      TransitionEnum.CopyLine2CreateCopyRestoration,
      StateEnum.CopyLineCreated,
      StateEnum.CreateCopyRestoration,
      appFacadeApi,
      stateFactory
    );
  }

  protected _execute(): boolean {
    this.objectManager.getCopyline(this.objectManager.preparationToothNumber).export(this.appFacadeApi);
    return true;
  }

  protected _evaluate(): boolean {
    return true;
  }
}
