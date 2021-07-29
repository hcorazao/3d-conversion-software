import { StateEnum } from '../states/StateEnum';
import ITransition from './ITransition';
import { TransitionEnum } from './TransitionEnum';

/**
 * Transition factory for creating transitions, implemented as a Singleton.
 */
export default interface ITransitionFactory {
  isActiveStateLinkedWith(state: StateEnum): { linked: boolean; evaluate: boolean };
  gotoState(state: StateEnum): boolean;
  getTransition(transition: TransitionEnum): ITransition;
}
