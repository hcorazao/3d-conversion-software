import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { Subject } from 'rxjs';
import { ProfilePreferences } from '../../../../models/profile-preferences.model';
import { select, Store } from '@ngrx/store';
import * as fromSelectors from '../../../../store/selectors';
import { takeUntil } from 'rxjs/operators';
import { DentalNotation } from '../../../../models/enums/jaw.enum';
import ToothNumberNotation from '../../../rendering/components/ToothNumberNotation';

@Component({
  selector: 'app-case-details-card',
  templateUrl: './case-details-card.component.html',
  styleUrls: ['./case-details-card.component.scss'],
})
export class CaseDetailsCardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  @Input() dentalCaseFolder: DentalCaseFolder;
  profilePreferences: ProfilePreferences;
  toothNumber: number | string;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .pipe(select(fromSelectors.getProfilePreferences), takeUntil(this.destroy$))
      .subscribe((profilePreferences: ProfilePreferences) => {
        this.profilePreferences = profilePreferences;
        this.toothNumber = this.getToothNumberForProfilePreferences(profilePreferences);
      });
  }

  getToothNumberForProfilePreferences(profilePreferences) {
    if (profilePreferences.dentalNotation === DentalNotation.UNS) {
      return ToothNumberNotation.FDIToADA(Number(this.dentalCaseFolder?.dentalCase?.preparationToothNumber));
    }
    return (this.toothNumber = this.dentalCaseFolder?.dentalCase?.preparationToothNumber);
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
