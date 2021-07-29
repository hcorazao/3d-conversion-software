import IState from './IState';
import { StateEnum } from './StateEnum';

/**
 * State factory for creating states, implemented as a Singleton.
 */
export default interface IStateFactory {
  /**
   *
   * @param state
   * @returns state
   */
  getState(state: StateEnum): IState;

  /**
   * Returns the currently active state
   * @returns active state
   */
  getActiveState(): IState;
}
