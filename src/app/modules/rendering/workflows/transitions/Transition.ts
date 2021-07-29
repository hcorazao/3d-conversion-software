import { AppFacadeApi } from '@app/facade/app-facade-api';
import ITransition from './ITransition';
import { StateEnum } from './../states/StateEnum';
import { TransitionEnum } from './TransitionEnum';
import IStateFactory from '../states/IStateFactory';
import SceneObjectsManager from '../../components/SceneObjectsManager';

export default abstract class Transition implements ITransition {
  protected static instance;
  protected appFacadeApi: AppFacadeApi;
  public stateFactory: IStateFactory;

  protected transitionEnum: TransitionEnum;

  protected startState: StateEnum;
  protected endState: StateEnum;

  protected objectManager: SceneObjectsManager;

  protected abstract _evaluate(): boolean;
  protected abstract _execute(): boolean;

  protected constructor(
    transitionEnum: TransitionEnum,
    startState: StateEnum,
    endState: StateEnum,
    appFacadeApi: AppFacadeApi,
    stateFactory: IStateFactory
  ) {
    this.transitionEnum = transitionEnum;
    this.startState = startState;
    this.endState = endState;
    this.appFacadeApi = appFacadeApi;
    this.stateFactory = stateFactory;

    this.objectManager = SceneObjectsManager.GetInstance();
  }

  /**
   * Executes the transition
   * @returns true if execute was successful
   */
  public execute(): boolean {
    try {
      // first validation: check if the start state is really the active state
      if (!this.stateFactory.getState(this.startState).isActive()) {
        console.warn(
          '[BSM] Start state ' +
            this.startState +
            ' from transition ' +
            this.transitionEnum +
            ' is not the active state! Current active state: ' +
            this.stateFactory.getActiveState()
        );
        return false;
      }

      // second validation: is this transition registered in the start state
      if (!this.stateFactory.getState(this.startState).isRegistered(this.transitionEnum)) {
        console.warn('[BSM] Transition ' + this.transitionEnum + ' is not registered in start state ' + this.startState + '!');
        return false;
      }

      // third validation: check if transition is currently valid
      if (!this._evaluate()) {
        console.warn(
          '[BSM] Transition ' + this.transitionEnum + ' (from ' + this.startState + ' to ' + this.endState + ') is currently not valid!'
        );
        return false;
      }

      console.log('[BSM] Starting transition ' + this.transitionEnum + ' (from ' + this.startState + ' to ' + this.endState + ')');

      //
      // exit the start state
      //
      if (!this.stateFactory.getState(this.startState).onExit()) {
        return false;
      }

      //
      // execute the transition
      //
      let success;
      try {
        success = this._execute();
      } catch (error) {
        success = false;
      }

      if (success) {
        console.log('[BSM] Transition ' + this.transitionEnum + ' successfully executed.');
      } else {
        console.error('[BSM] An error occured while executing transition ' + this.transitionEnum);

        // return to start state
        this.stateFactory.getState(this.startState).onEnter();
        return false;
      }

      //
      // enter the end state
      //
      if (!this.stateFactory.getState(this.endState).onEnter()) {
        // return to start state
        this.stateFactory.getState(this.startState).onEnter();
        return false;
      }

      return success;
    } catch (error) {
      console.error('[BSM] Exception while executing transition ' + this.transitionEnum + ' - Error: ' + error);
      return false;
    }
  }

  /**
   * Evaluates transition
   * @returns true if evaluate
   */
  public evaluate(): boolean {
    try {
      return this._evaluate();
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public isEndState(state: StateEnum): boolean {
    return this.endState === state;
  }
}
