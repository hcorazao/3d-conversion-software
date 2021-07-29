import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

export default class PrepMargin2CopyRestorationTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(
      TransitionEnum.PrepMargin2CopyRestoration,
      StateEnum.PreparationMarginEntered,
      StateEnum.CopyRestorationCreated,
      appFacadeApi,
      stateFactory
    );
  }

  protected _execute(): boolean {
    return true;
  }

  protected _evaluate(): boolean {
    return this.objectManager.restorations[this.objectManager.preparationToothNumber] ? true : false;
  }
}
