import { CaseProcessingStep } from '@app/models/enums/case-processing-step';
import { TransitionEnum } from '@app/modules/rendering/workflows/transitions/TransitionEnum';

export class StepperJump {
  constructor(public destinationStep: CaseProcessingStep, public transitionToMake: TransitionEnum) {}
}
