import { AppFacadeApi } from '@app/facade/app-facade-api';
import ITransitionFactory from '../transitions/ITransitionFactory';
import { TransitionEnum } from '../transitions/TransitionEnum';
import State from './State';
import { StateEnum } from './StateEnum';

export default class PreparationImportedState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.PreparationImported, appFacadeApi, transitionFactory, [TransitionEnum.PrepImported2EnterMargin]);
  }

  protected _onEnter(): boolean {
    return true;
  }

  protected _onExit(): boolean {
    return true;
  }
}
