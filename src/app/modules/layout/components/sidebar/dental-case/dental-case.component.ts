import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DentalCaseSimple } from '@app/models/dental-case-simple.model';
import { TimeUtilsService } from '@app/shared/utils/time-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { getTranslationKeyForCaseCompletionStatus } from '@app/models/enums/case-completion-status.enum';

const CASE_NOT_AVAILABLE_IN_IMPORT_FOLDER_ERROR_TRANSLATION_KEY = 'sidebar.errors.caseNotAvailableInImportFolder';
@Component({
  selector: 'app-dental-case',
  templateUrl: './dental-case.component.html',
  styleUrls: ['./dental-case.component.scss'],
})
export class DentalCaseComponent implements OnInit {
  getTranslationKeyForCaseCompletionStatus = getTranslationKeyForCaseCompletionStatus;

  @Input() dentalCase: DentalCaseSimple;
  @Output() dentalCaseSelected = new EventEmitter();

  tooltip = '';

  constructor(private translate: TranslateService, private timeUtils: TimeUtilsService) {}

  ngOnInit(): void {
    if (!this.dentalCase.availableInImportFolder) {
      this.translate.get(CASE_NOT_AVAILABLE_IN_IMPORT_FOLDER_ERROR_TRANSLATION_KEY).subscribe((errorTranslation) => {
        this.tooltip = errorTranslation;
      });
    }
    if (this.dentalCase.errorMessage) {
      this.tooltip = this.dentalCase.errorMessage;
    }
  }

  getNumberFromFormattedElapsedTime(date: Date) {
    return this.timeUtils.formatElapsedTime(date)?.prefixNumber;
  }

  getTextSuffixTranslationKeyFromFormattedElapsedTime(date: Date) {
    return this.timeUtils.formatElapsedTime(date)?.textSuffixTranslationKey;
  }

  handleDentalCaseSelected() {
    if (this.dentalCase.availableInImportFolder && !this.dentalCase.errorMessage) {
      this.dentalCaseSelected.emit(this.dentalCase.caseName);
    }
  }
}
