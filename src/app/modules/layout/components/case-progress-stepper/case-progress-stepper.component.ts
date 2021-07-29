import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, HostListener } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import {
  PrepareResultExport,
  ChangeCaseProcessingStep,
  FolderHandleForCaseFolderUploaded,
  CompleteCase,
  UndoActionInStep,
  RedoActionInStep,
  JumpToCaseProcessingStepWithTransition,
} from '@app/store/actions/babylon.actions';
import {
  getCaseProcessingStepByValue,
  CaseProcessingStep,
  CaseProcessingMainStep,
  getCaseProcessingMainStepForStepValue,
  getSubstepForStep,
} from '@app/models/enums/case-processing-step';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ButtonType } from '../button/button.component';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { AddToastNotificationByType } from '@app/store/actions/notifications.actions';
import { DialogManagerService } from '../../services/dialog-manager.service';
import { StepperJump } from '@app/models/stepper-jump.model';
import { takeUntil } from 'rxjs/operators';
import { TransitionEnum } from '@app/modules/rendering/workflows/transitions/TransitionEnum';

const stepsNumberTitles = [
  'caseProgressStepper.mainSteps.importStep.stepNumberTitle',
  'caseProgressStepper.mainSteps.preparationMarginStep.stepNumberTitle',
  'caseProgressStepper.mainSteps.insertionAxisStep.stepNumberTitle',
  'caseProgressStepper.mainSteps.copyLineStep.stepNumberTitle',
  'caseProgressStepper.mainSteps.contactAndThicknessStep.stepNumberTitle',
  'caseProgressStepper.mainSteps.exportStep.stepNumberTitle',
];

@Component({
  selector: 'app-case-progress-stepper',
  templateUrl: './case-progress-stepper.component.html',
  styleUrls: ['./case-progress-stepper.component.scss'],
})
export class CaseProgressStepperComponent implements OnInit, OnDestroy {
  ButtonType = ButtonType;

  @Input() minimized: boolean;
  @Input() tipsEnabled: boolean;
  @Output() toggleTipsEnabled = new EventEmitter();

  private destroy$ = new Subject();
  caseProcessingStep$: Observable<CaseProcessingStep>;
  caseProcessingMainStep$: Observable<CaseProcessingMainStep>;
  caseProcessingSubstep$: Observable<number>;
  nextStepButtonDisabled$: Observable<boolean>;
  previousStepButtonDisabled$: Observable<boolean>;
  undoButtonEnabled$: Observable<boolean>;
  redoButtonEnabled$: Observable<boolean>;
  stepperJumpsAvailabilities: boolean[];
  stepperJumpsTransitions: (TransitionEnum | null)[];
  stepperJumpsSubstepsTargets: CaseProcessingStep[];
  cadAssistantExportDisabled$: Observable<boolean>;

  currentStep = 1;
  minStep = 1;
  maxStep = 8;
  currentMainStep = 1;
  currentSubstep = 1;
  chooseFolderVisible = false;

  constructor(private store: Store, public translate: TranslateService, private dialogManager: DialogManagerService) {}

  ngOnInit() {
    this.subscribeToStoreSelectors();
  }

  @HostListener('window:keydown.control.z', ['$event'])
  @HostListener('window:keydown.meta.z', ['$event'])
  undoActionOnKeyShortcut(event: KeyboardEvent) {
    event.preventDefault();
    this.undoActionInStep();
  }

  @HostListener('window:keydown.control.y', ['$event'])
  @HostListener('window:keydown.meta.y', ['$event'])
  redoActionOnKeyShortcut(event: KeyboardEvent) {
    event.preventDefault();
    this.redoActionInStep();
  }

  @HostListener('window:keydown.control.arrowLeft', ['$event'])
  @HostListener('window:keydown.meta.arrowLeft', ['$event'])
  goToPreviousStepOnKeyShortcut(event: KeyboardEvent) {
    event.preventDefault();
    this.goToPreviousStep();
  }

  @HostListener('window:keydown.control.arrowRight', ['$event'])
  @HostListener('window:keydown.meta.arrowRight', ['$event'])
  goToNextStepOnKeyShortcut(event: KeyboardEvent) {
    event.preventDefault();
    this.goToNextStep();
  }

  subscribeToStoreSelectors() {
    this.caseProcessingStep$ = this.store.pipe(select(fromSelectors.getCaseProcessingStep), takeUntil(this.destroy$));
    this.caseProcessingStep$.subscribe((step: CaseProcessingStep) => {
      this.currentStep = +step;
      this.currentMainStep = getCaseProcessingMainStepForStepValue(this.currentStep);
      this.currentSubstep = getSubstepForStep(this.currentStep);
    });
    this.nextStepButtonDisabled$ = this.store.pipe(select(fromSelectors.isNextStepButtonDisabled), takeUntil(this.destroy$));
    this.previousStepButtonDisabled$ = this.store.pipe(select(fromSelectors.isPreviousStepButtonDisabled), takeUntil(this.destroy$));
    this.undoButtonEnabled$ = this.store.pipe(select(fromSelectors.isUndoButtonEnabled), takeUntil(this.destroy$));
    this.redoButtonEnabled$ = this.store.pipe(select(fromSelectors.isRedoButtonEnabled), takeUntil(this.destroy$));
    this.store.pipe(select(fromSelectors.getStepperJumpsConfiguration), takeUntil(this.destroy$)).subscribe((stepperJumpsConfiguration) => {
      this.stepperJumpsAvailabilities = stepperJumpsConfiguration.getStepsAvailabilitiesArray();
      this.stepperJumpsTransitions = stepperJumpsConfiguration.getStepsTransitionsArray();
      this.stepperJumpsSubstepsTargets = stepperJumpsConfiguration.getTargetSubstepsArray();
    });
    this.cadAssistantExportDisabled$ = this.store.pipe(select(fromSelectors.getCadAssistantExportDisabled), takeUntil(this.destroy$));
  }

  getCurrentBodyHeaderTranslationKey() {
    return stepsNumberTitles[this.currentMainStep - 1];
  }

  chooseFolder() {
    if ('showDirectoryPicker' in window) {
      (window as any)
        .showDirectoryPicker()
        .then((folderHandle) => {
          this.store.dispatch(new FolderHandleForCaseFolderUploaded({ folderHandle }));
        })
        .catch((error) => {
          if (error.message !== 'The user aborted a request.') {
            this.store.dispatch(new AddToastNotificationByType({ type: ToastNotificationType.PERMISSION_TO_FOLDER_NOT_GRANTED_ERROR }));
          }
        });
    }
  }

  jumpToStepAfterStepHeaderClicked(jump: StepperJump) {
    if (jump && jump.destinationStep && jump.transitionToMake) {
      if (jump.destinationStep === CaseProcessingStep.IMPORT) {
        this.dialogManager.openConfirmationDialog('sidebar.backToImportStepModal', () => {
          this.currentStep = jump.destinationStep;
          this.store.dispatch(
            new JumpToCaseProcessingStepWithTransition({
              jump,
            })
          );
        });
      } else {
        this.store.dispatch(
          new JumpToCaseProcessingStepWithTransition({
            jump,
          })
        );
      }
    }
  }

  goToPreviousStep() {
    const newStep = Math.max(this.minStep, this.currentStep - 1);
    if (newStep === this.minStep) {
      this.dialogManager.openConfirmationDialog('sidebar.backToImportStepModal', () => {
        this.currentStep = newStep;
        this.dispatchActionWithNewStep(this.currentStep);
      });
    } else {
      this.currentStep = newStep;
      this.dispatchActionWithNewStep(this.currentStep);
    }
  }

  goToNextStep() {
    this.currentStep = Math.min(this.maxStep, this.currentStep + 1);
    this.dispatchActionWithNewStep(this.currentStep);
  }

  dispatchActionWithNewStep(step: number) {
    this.store.dispatch(
      new ChangeCaseProcessingStep({
        step: getCaseProcessingStepByValue(step),
      })
    );
  }

  completeAndExportCase() {
    this.store.dispatch(new CompleteCase());
    this.store.dispatch(new PrepareResultExport());
  }

  undoActionInStep() {
    this.store.dispatch(new UndoActionInStep());
  }

  redoActionInStep() {
    this.store.dispatch(new RedoActionInStep());
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
