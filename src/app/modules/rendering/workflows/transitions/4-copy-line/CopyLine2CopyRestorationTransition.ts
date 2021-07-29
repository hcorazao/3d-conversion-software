import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

export default class CopyLine2CopyRestorationTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(TransitionEnum.CopyLine2CopyRestoration, StateEnum.CopyLineCreated, StateEnum.CopyRestorationCreated, appFacadeApi, stateFactory);
  }

  protected _execute(): boolean {
    return true;
  }

  protected _evaluate(): boolean {
    return this.objectManager.restorations[this.objectManager.preparationToothNumber] ? true : false;
  }
}
