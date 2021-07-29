import { StateEnum } from '../states/StateEnum';

export default interface ITransition {
  evaluate(): boolean;
  execute(): boolean;
  isEndState(state: StateEnum): boolean;
}
