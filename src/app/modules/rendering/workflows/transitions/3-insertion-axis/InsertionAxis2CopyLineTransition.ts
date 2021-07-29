import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

export default class InsertionAxis2CopyLineTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(TransitionEnum.InsertionAxis2CopyLine, StateEnum.InsertionAxisCreated, StateEnum.CopyLineCreated, appFacadeApi, stateFactory);
  }

  protected _execute(): boolean {
    return true;
  }

  protected _evaluate(): boolean {
    return this.objectManager.getCopyline(this.objectManager.preparationToothNumber) ? true : false;
  }
}
