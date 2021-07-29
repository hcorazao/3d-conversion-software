import { AppFacadeApi } from '@app/facade/app-facade-api';
import IState from './IState';
import { StateEnum } from './StateEnum';
import { TransitionEnum } from './../transitions/TransitionEnum';
import ITransitionFactory from '../transitions/ITransitionFactory';
import ITransition from '../transitions/ITransition';
import SceneObjectsManager from '../../components/SceneObjectsManager';

export default abstract class State implements IState {
  protected appFacadeApi: AppFacadeApi;
  protected stateEnum: StateEnum;
  protected transitions: TransitionEnum[];
  protected active: boolean;
  protected objectManager: SceneObjectsManager;
  public transitionFactory: ITransitionFactory;

  protected abstract _onEnter(): boolean;
  protected abstract _onExit(): boolean;

  protected constructor(
    stateEnum: StateEnum,
    appFacadeApi: AppFacadeApi,
    transitionFactory: ITransitionFactory,
    transitions: TransitionEnum[]
  ) {
    this.appFacadeApi = appFacadeApi;
    this.stateEnum = stateEnum;
    this.transitionFactory = transitionFactory;
    this.transitions = transitions;
    this.active = false;

    this.objectManager = SceneObjectsManager.GetInstance();
  }

  public onEnter(): boolean {
    try {
      console.log('[BSM] Try to enter state ' + this.stateEnum);

      const success = this._onEnter();

      if (success) {
        this.active = true;
        console.log('[BSM] State ' + this.stateEnum + ' successfully entered.');
      } else {
        console.warn('[BSM] An error occured while entering state ' + this.stateEnum);
      }

      return success;
    } catch (error) {
      console.error('[BSM] Exception while entering state ' + this.stateEnum + ' - Error: ' + error);
      return false;
    }
  }

  public onExit(): boolean {
    try {
      console.log('[BSM] Try to exit state ' + this.stateEnum);

      const success = this._onExit();

      if (success) {
        this.active = false;
        console.log('[BSM] State ' + this.stateEnum + ' successfully exited.');
      } else {
        console.warn('[BSM] An error occured while exiting state ' + this.stateEnum);
      }

      return success;
    } catch (error) {
      console.error('[BSM] Exception while exiting state ' + this.stateEnum + ' - Error: ' + error);
      return false;
    }
  }

  public isState(state: StateEnum): boolean {
    return this.stateEnum === state;
  }

  public isActive(): boolean {
    return this.active;
  }

  public isRegistered(transition: TransitionEnum): boolean {
    return this.transitions.includes(transition);
  }

  public getTransition(state: StateEnum): ITransition {
    for (const transitionEnum of this.transitions) {
      const transition = this.transitionFactory.getTransition(transitionEnum);
      if (transition && transition.isEndState(state)) {
        return transition;
      }
    }
    return undefined;
  }

  public evaluateTransitions(): {
    transitionEnum: TransitionEnum;
    transition: ITransition;
    evaluation: boolean;
  }[] {
    const ret = [];
    for (const transitionEnum of this.transitions) {
      const transition = this.transitionFactory.getTransition(transitionEnum);
      ret.push({ transitionEnum, transition, evaluation: transition ? transition.evaluate() : false });
    }
    return ret;
  }
}
