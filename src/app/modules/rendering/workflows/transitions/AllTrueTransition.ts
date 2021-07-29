import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../states/IStateFactory';
import { StateEnum } from '../states/StateEnum';
import Transition from './Transition';
import { TransitionEnum } from './TransitionEnum';

export default class AllTrueTransition extends Transition {
  constructor(
    transitionEnum: TransitionEnum,
    startState: StateEnum,
    endState: StateEnum,
    appFacadeApi: AppFacadeApi,
    stateFactory: IStateFactory
  ) {
    super(transitionEnum, startState, endState, appFacadeApi, stateFactory);
  }

  protected _execute(): boolean {
    return true;
  }

  protected _evaluate(): boolean {
    return true;
  }
}
