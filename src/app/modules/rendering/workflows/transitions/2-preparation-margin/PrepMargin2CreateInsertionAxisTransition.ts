import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

/**
 * Prep margin to create insertion axis transition
 * -----------------------------------------------
 * After editing the margin and click on next, this transition leads to creating the insertion axis. In this
 * transition, the prep margin will be stored.
 */
export default class PrepMargin2CreateInsertionAxisTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(
      TransitionEnum.PrepMargin2CreateInsertionAxis,
      StateEnum.PreparationMarginEntered,
      StateEnum.CreateInsertionAxis,
      appFacadeApi,
      stateFactory
    );
  }

  protected _execute(): boolean {
    this.objectManager.getMargin(this.objectManager.preparationToothNumber).export(this.appFacadeApi);
    return true;
  }

  protected _evaluate(): boolean {
    return true;
  }
}
