import { AppFacadeApi } from '@app/facade/app-facade-api';
import ITransitionFactory from '../transitions/ITransitionFactory';
import State from './State';
import { StateEnum } from './StateEnum';

export default class TrueState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.TrueState, appFacadeApi, transitionFactory, []);
  }

  protected _onEnter(): boolean {
    return true;
  }

  protected _onExit(): boolean {
    return true;
  }
}
