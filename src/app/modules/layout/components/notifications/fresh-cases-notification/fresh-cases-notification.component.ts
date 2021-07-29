import { Component, OnInit, Input } from '@angular/core';
import { DentalCaseSimple } from '@app/models/dental-case-simple.model';
import { TimeUtilsService } from '@app/shared/utils/time-utils.service';
import { getTranslationKeyForCaseCompletionStatus } from '@app/models/enums/case-completion-status.enum';
import { trigger, state, style, transition, animate, group } from '@angular/animations';

@Component({
  selector: 'app-fresh-cases-notification',
  templateUrl: './fresh-cases-notification.component.html',
  styleUrls: ['./fresh-cases-notification.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('expanded', style({ height: '*', opacity: '1', marginBottom: '8px' })),
      state('collapsed', style({ height: 0, opacity: 0, marginBottom: 0 })),

      transition('collapsed => expanded', [
        group([animate(200, style({ height: '*', marginBottom: '8px' })), animate(200, style({ opacity: '1' }))]),
      ]),
      transition('expanded => collapsed', [
        group([animate(200, style({ opacity: 0 })), animate(200, style({ height: 0, marginBottom: 0 }))]),
      ]),
    ]),
  ],
})
export class FreshCasesNotificationComponent implements OnInit {
  getTranslationKeyForCaseCompletionStatus = getTranslationKeyForCaseCompletionStatus;

  @Input() freshDentalCases: DentalCaseSimple[];

  minimized = true;

  constructor(private timeUtils: TimeUtilsService) {}

  ngOnInit(): void {}

  toggleMinimization() {
    this.minimized = !this.minimized;
  }

  getTitleTranslationKey() {
    if (!this.minimized && this.freshDentalCases && this.freshDentalCases.length === 3) {
      return 'notification.freshCases.title.threeFound';
    } else if (!this.minimized && this.freshDentalCases && this.freshDentalCases.length === 2) {
      return 'notification.freshCases.title.twoFound';
    } else {
      return 'notification.freshCases.title.oneFound';
    }
  }

  getNumberFromFormattedElapsedTime(date: Date) {
    return this.timeUtils.formatElapsedTime(date)?.prefixNumber;
  }

  getTextSuffixTranslationKeyFromFormattedElapsedTime(date: Date) {
    return this.timeUtils.formatElapsedTime(date)?.textSuffixTranslationKey;
  }
}
