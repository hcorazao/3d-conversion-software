import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

export default class PrepMargin2ExportRestorationTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(
      TransitionEnum.PrepMargin2ExportRestoration,
      StateEnum.PreparationMarginEntered,
      StateEnum.ExportRestoration,
      appFacadeApi,
      stateFactory
    );
  }

  protected _execute(): boolean {
    return true;
  }

  protected _evaluate(): boolean {
    return false;
  }
}
