import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { ButtonType } from '../../button/button.component';

@Component({
  selector: 'app-case-progress-step',
  templateUrl: './case-progress-step.component.html',
  styleUrls: ['./case-progress-step.component.scss'],
  animations: [
    trigger('slowExpandCollapse', [
      state(
        'expanded',
        style({ height: '*', 'margin-top': '*', 'margin-bottom': '*', 'padding-top': '*', 'padding-bottom': '*', opacity: '1' })
      ),
      state('collapsed', style({ height: 0, 'margin-top': 0, 'margin-bottom': 0, 'padding-top': 0, 'padding-bottom': 0, opacity: 0 })),

      transition('collapsed => expanded', [
        group([
          animate(
            1000,
            style({ height: '*', 'margin-top': '*', 'margin-bottom': '*', 'padding-top': '*', 'padding-bottom': '*', opacity: '1' })
          ),
        ]),
      ]),
      transition('expanded => collapsed', [
        group([
          animate(1000, style({ height: 0, 'margin-top': 0, 'margin-bottom': 0, 'padding-top': 0, 'padding-bottom': 0, opacity: 0 })),
        ]),
      ]),
    ]),
    trigger('quickExpandCollapse', [
      state(
        'expanded',
        style({ height: '*', 'margin-top': '*', 'margin-bottom': '*', 'padding-top': '*', 'padding-bottom': '*', opacity: '1' })
      ),
      state('collapsed', style({ height: 0, 'margin-top': 0, 'margin-bottom': 0, 'padding-top': 0, 'padding-bottom': 0, opacity: 0 })),

      transition('collapsed => expanded', [
        group([
          animate(
            300,
            style({ height: '*', 'margin-top': '*', 'margin-bottom': '*', 'padding-top': '*', 'padding-bottom': '*', opacity: '1' })
          ),
        ]),
      ]),
      transition('expanded => collapsed', [
        group([animate(300, style({ height: 0, 'margin-top': 0, 'margin-bottom': 0, 'padding-top': 0, 'padding-bottom': 0, opacity: 0 }))]),
      ]),
    ]),
    trigger('fadeInOut', [
      state('opaque', style({ opacity: '1' })),
      state('transparent', style({ opacity: '0' })),

      transition('transparent => opaque', [group([animate(300, style({ opacity: '1' }))])]),
      transition('opaque => transparent', [group([animate('0.4s', style({ opacity: '0' }))])]),
    ]),
  ],
})
export class CaseProgressStepComponent implements OnInit {
  ButtonType = ButtonType;

  @Input() mainStep: number;
  @Input() currentMainStep: number;
  @Input() currentSubstep: number;
  @Input() title: string;
  @Input() lastStep = false;
  @Input() tipsEnabled: boolean;
  @Input() substeps: any[];
  @Input() undoEnabled: boolean;
  @Input() redoEnabled: boolean;
  @Input() jumpAvailable: boolean;
  @Output() stepHeaderClicked = new EventEmitter();
  @Output() undo = new EventEmitter();
  @Output() redo = new EventEmitter();

  isHovered = false;

  toggleHovered(hoverState: boolean): void {
    this.isHovered = hoverState;
  }

  constructor() {}

  ngOnInit(): void {}
}
