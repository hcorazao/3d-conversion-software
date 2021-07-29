import ITransition from '../transitions/ITransition';
import { TransitionEnum } from '../transitions/TransitionEnum';
import { StateEnum } from './StateEnum';

/**
 * Interface for all states
 */
export default interface IState {
  /**
   * Called when entering a new state
   * @returns true if entering was successful
   */
  onEnter(): boolean;

  /**
   * Called when exiting the current state
   * @returns true if exiting was successful
   */
  onExit(): boolean;

  isState(state: StateEnum): boolean;

  /**
   * Returns if the state is active
   * @returns true if state is active
   */
  isActive(): boolean;

  isRegistered(transition: TransitionEnum): boolean;

  evaluateTransitions(): {
    transitionEnum: TransitionEnum;
    transition: ITransition;
    evaluation: boolean;
  }[];

  getTransition(state: StateEnum): ITransition;
}
