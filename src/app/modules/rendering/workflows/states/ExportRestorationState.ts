import { AppFacadeApi } from '@app/facade/app-facade-api';
import ITransitionFactory from '../transitions/ITransitionFactory';
import { TransitionEnum } from '../transitions/TransitionEnum';
import State from './State';
import { StateEnum } from './StateEnum';

export default class ExportRestorationState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.ExportRestoration, appFacadeApi, transitionFactory, [
      TransitionEnum.ExportRestoration2AppStarted,
      TransitionEnum.ExportRestoration2PrepMargin,
      TransitionEnum.ExportRestoration2InsertionAxis,
      TransitionEnum.ExportRestoration2CopyLine,
      TransitionEnum.ExportRestoration2CopyRestoration,
    ]);
  }

  protected _onEnter(): boolean {
    return true;
  }

  protected _onExit(): boolean {
    return true;
  }
}
