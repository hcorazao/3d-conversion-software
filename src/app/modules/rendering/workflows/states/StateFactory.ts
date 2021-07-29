import IState from './IState';
import IStateFactory from './IStateFactory';
import ITransitionFactory from '../transitions/ITransitionFactory';
import { StateEnum } from './StateEnum';
import { AppFacadeApi } from '@app/facade/app-facade-api';

import TrueState from './TrueState';

// 1 Import
import AppStartedState from './AppStartedState';
import PreparationImportedState from './PreparationImportedState';
// 2 Preparation Margin
import EnterPreparationMarginState from './EnterPreparationMarginState';
import PreparationMarginEnteredState from './PreparationMarginEnteredState';
// 3 Insertion Axis
import CreateInsertionAxisState from './CreateInsertionAxisState';
import InsertionAxisCreatedState from './InsertionAxisCreatedState';
// 4 Copy Line
import CreateCopyLineState from './copy_mode/CreateCopyLineState';
import CopyLineCreatedState from './copy_mode/CopyLineCreatedState';
// 5 Restoration
import CreateCopyRestorationState from './copy_mode/CreateCopyRestorationState';
import CopyRestorationCreatedState from './copy_mode/CopyRestorationCreatedState';
// 6 Export
import ExportRestorationState from './ExportRestorationState';

/**
 * State factory for creating states, implemented as a Singleton.
 */
export default class StateFactory implements IStateFactory {
  protected static instance: StateFactory;
  protected appFacadeApi: AppFacadeApi;
  public transitionFactory: ITransitionFactory;

  protected instances: IState[];

  protected constructor(appFacadeApi: AppFacadeApi) {
    this.appFacadeApi = appFacadeApi;
    this.instances = [];
    this.instances.length = Object.keys(StateEnum).length;
  }

  /**
   * Gets the instance of the StateFactory (Singleton)
   * @param appFacadeApi the API to Angular
   * @returns instance of StateFactory
   */
  static GetInstance(appFacadeApi: AppFacadeApi): StateFactory {
    if (!this.instance) {
      this.instance = new StateFactory(appFacadeApi);
    }
    return this.instance;
  }

  getState(state: StateEnum): IState {
    if (this.instances[state]) {
      return this.instances[state];
    }

    switch (state) {
      case StateEnum.TrueState:
        this.instances[state] = new TrueState(this.appFacadeApi, this.transitionFactory);
        break;

      // 1 Import
      case StateEnum.AppStarted:
        this.instances[state] = new AppStartedState(this.appFacadeApi, this.transitionFactory);
        break;
      case StateEnum.PreparationImported:
        this.instances[state] = new PreparationImportedState(this.appFacadeApi, this.transitionFactory);
        break;

      // 2 Preparation Margin
      case StateEnum.EnterPreparationMargin:
        this.instances[state] = new EnterPreparationMarginState(this.appFacadeApi, this.transitionFactory);
        break;
      case StateEnum.PreparationMarginEntered:
        this.instances[state] = new PreparationMarginEnteredState(this.appFacadeApi, this.transitionFactory);
        break;

      // 3 Insertion Axis
      case StateEnum.CreateInsertionAxis:
        this.instances[state] = new CreateInsertionAxisState(this.appFacadeApi, this.transitionFactory);
        break;
      case StateEnum.InsertionAxisCreated:
        this.instances[state] = new InsertionAxisCreatedState(this.appFacadeApi, this.transitionFactory);
        break;

      // 4 Copy Line
      case StateEnum.CreateCopyLine:
        this.instances[state] = new CreateCopyLineState(this.appFacadeApi, this.transitionFactory);
        break;
      case StateEnum.CopyLineCreated:
        this.instances[state] = new CopyLineCreatedState(this.appFacadeApi, this.transitionFactory);
        break;

      // 5 Restoration
      case StateEnum.CreateCopyRestoration:
        this.instances[state] = new CreateCopyRestorationState(this.appFacadeApi, this.transitionFactory);
        break;
      case StateEnum.CopyRestorationCreated:
        this.instances[state] = new CopyRestorationCreatedState(this.appFacadeApi, this.transitionFactory);
        break;

      // 6 Export
      case StateEnum.ExportRestoration:
        this.instances[state] = new ExportRestorationState(this.appFacadeApi, this.transitionFactory);
        break;

      default:
        console.warn('No state found!');
    }
    return this.instances[state];
  }

  /**
   * Returns the currently active state
   * @returns active state
   */
  getActiveState(): IState {
    for (const value of Object.values(StateEnum)) {
      if (this.instances[value]?.isActive()) {
        return this.instances[value];
      }
    }

    return null;
  }
}
