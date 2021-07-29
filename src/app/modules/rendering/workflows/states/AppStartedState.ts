import { AppFacadeApi } from '@app/facade/app-facade-api';
import ITransitionFactory from '../transitions/ITransitionFactory';
import { TransitionEnum } from '../transitions/TransitionEnum';
import State from './State';
import { StateEnum } from './StateEnum';

export default class AppStartedState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.AppStarted, appFacadeApi, transitionFactory, [TransitionEnum.Start2PrepImported]);
  }

  protected _onEnter(): boolean {
    this.objectManager.dispose();
    return true;
  }

  protected _onExit(): boolean {
    return true;
  }
}
