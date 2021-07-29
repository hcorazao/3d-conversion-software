import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { CaseProcessingStep } from '@app/models/enums/case-processing-step';
import { TransitionEnum } from '@app/modules/rendering/workflows/transitions/TransitionEnum';
import { StepperJump } from '@app/models/stepper-jump.model';

type ProgressStep = {
  mainStepOrderNumber: number;
  titleTranslationKey: string;
  substeps: { substepNumber: number; prefixTranslationKey: string; buttonsAvailable: boolean }[];
};
const steps: ProgressStep[] = [
  {
    mainStepOrderNumber: 1,
    titleTranslationKey: 'caseProgressStepper.mainSteps.importStep.title',
    substeps: [
      {
        substepNumber: 1,
        prefixTranslationKey: 'caseProgressStepper.mainSteps.importStep.substeps.importCaseFolder.',
        buttonsAvailable: false,
      },
    ],
  },
  {
    mainStepOrderNumber: 2,
    titleTranslationKey: 'caseProgressStepper.mainSteps.preparationMarginStep.title',
    substeps: [
      {
        substepNumber: 1,
        prefixTranslationKey: 'caseProgressStepper.mainSteps.preparationMarginStep.substeps.drawPreparationMargin.',
        buttonsAvailable: true,
      },
      {
        substepNumber: 2,
        prefixTranslationKey: 'caseProgressStepper.mainSteps.preparationMarginStep.substeps.adjustPreparationMargin.',
        buttonsAvailable: true,
      },
    ],
  },
  {
    mainStepOrderNumber: 3,
    titleTranslationKey: 'caseProgressStepper.mainSteps.insertionAxisStep.title',
    substeps: [
      {
        substepNumber: 1,
        prefixTranslationKey: 'caseProgressStepper.mainSteps.insertionAxisStep.substeps.confirmOrEditInsertionAxis.',
        buttonsAvailable: false,
      },
    ],
  },
  {
    mainStepOrderNumber: 4,
    titleTranslationKey: 'caseProgressStepper.mainSteps.copyLineStep.title',
    substeps: [
      {
        substepNumber: 1,
        prefixTranslationKey: 'caseProgressStepper.mainSteps.copyLineStep.substeps.confirmOrEditCopyLine.',
        buttonsAvailable: true,
      },
    ],
  },
  {
    mainStepOrderNumber: 5,
    titleTranslationKey: 'caseProgressStepper.mainSteps.contactAndThicknessStep.title',
    substeps: [
      {
        substepNumber: 1,
        prefixTranslationKey: 'caseProgressStepper.mainSteps.contactAndThicknessStep.substeps.adjustMesialContact.',
        buttonsAvailable: true,
      },
      {
        substepNumber: 2,
        prefixTranslationKey: 'caseProgressStepper.mainSteps.contactAndThicknessStep.substeps.adjustDistalContact.',
        buttonsAvailable: true,
      },
      {
        substepNumber: 3,
        prefixTranslationKey: 'caseProgressStepper.mainSteps.contactAndThicknessStep.substeps.adjustOcclusalContact.',
        buttonsAvailable: true,
      },
    ],
  },
];

@Component({
  selector: 'app-case-progress-steps',
  templateUrl: './case-progress-steps.component.html',
  styleUrls: ['./case-progress-steps.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({ height: '*', opacity: '1' })),
      state('collapsed', style({ height: 0, opacity: 0 })),

      transition('collapsed => expanded', [group([animate(600, style({ height: '*' })), animate(450, style({ opacity: '1' }))])]),
      transition('expanded => collapsed', [group([animate(600, style({ height: 0 })), animate(450, style({ opacity: 0 }))])]),
    ]),
  ],
})
export class CaseProgressStepsComponent implements OnInit {
  @Input() currentMainStep: number;
  @Input() currentSubstep: number;
  @Input() minimized: boolean;
  @Input() tipsEnabled: boolean;
  @Input() undoEnabled: boolean;
  @Input() redoEnabled: boolean;
  @Input() jumpsAvailabilities: boolean[];
  @Input() jumpsTransitions: (TransitionEnum | null)[];
  @Input() jumpsSubstepsTargets: CaseProcessingStep[];
  @Output() stepHeaderClicked = new EventEmitter<StepperJump>();
  @Output() undo = new EventEmitter();
  @Output() redo = new EventEmitter();

  steps = steps;

  constructor() {}

  ngOnInit(): void {}

  onStepHeaderClicked(progressStep: ProgressStep) {
    this.stepHeaderClicked.emit(
      new StepperJump(this.jumpsSubstepsTargets[progressStep.mainStepOrderNumber], this.jumpsTransitions[progressStep.mainStepOrderNumber])
    );
  }
}
