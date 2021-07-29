import { AppFacadeApi } from '@app/facade/app-facade-api';
import IStateFactory from '../../states/IStateFactory';
import { StateEnum } from '../../states/StateEnum';
import Transition from '../Transition';
import { TransitionEnum } from '../TransitionEnum';

export default class Entered2EnterMarginTransition extends Transition {
  constructor(appFacadeApi: AppFacadeApi, stateFactory: IStateFactory) {
    super(
      TransitionEnum.Entered2EnterMargin,
      StateEnum.PreparationMarginEntered,
      StateEnum.EnterPreparationMargin,
      appFacadeApi,
      stateFactory
    );
  }

  protected _execute(): boolean {
    this.objectManager.disposeAllButJaws();
    this.appFacadeApi.getLoadedDentalCaseFolder().vectorsArrays.marginVectorsArray = undefined;
    return true;
  }

  protected _evaluate(): boolean {
    return true;
  }
}
