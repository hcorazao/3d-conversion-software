import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import { UpdatedCaseObjectsSettings } from '@app/store/actions/settings.actions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ObjectSettings } from '../../../../models/object-settings.model';

const definedCaseObjectsSettingsControls = [
  {
    objectName: 'upperJaw',
    titleTranslationKey: 'objectsToolbox.upperJawSlider.title',
  },
  {
    objectName: 'lowerJaw',
    titleTranslationKey: 'objectsToolbox.lowerJawSlider.title',
  },
  {
    objectName: 'upperJawSitu',
    titleTranslationKey: 'objectsToolbox.upperJawSituSlider.title',
  },
  {
    objectName: 'lowerJawSitu',
    titleTranslationKey: 'objectsToolbox.lowerJawSituSlider.title',
  },
  {
    objectName: 'crown',
    titleTranslationKey: 'objectsToolbox.crownSlider.title',
  },
];

@Component({
  selector: 'app-objects-toolbox',
  templateUrl: './objects-toolbox.component.html',
  styleUrls: ['./objects-toolbox.component.scss'],
})
export class ObjectsToolboxComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  caseObjectsSettings: CaseObjectsSettings = null;
  definedCaseObjectsSettingsControls = definedCaseObjectsSettingsControls;

  constructor(private store: Store) {}

  ngOnInit(): void {
    const caseObjectsSettings$ = this.store.pipe(select(fromSelectors.getCaseObjectsSettings), takeUntil(this.destroy$));
    caseObjectsSettings$.subscribe((caseObjectsSettings: CaseObjectsSettings) => {
      this.caseObjectsSettings = caseObjectsSettings;
    });
  }

  updateSettingsWithPatch(objectName: string, objectSettings: Partial<ObjectSettings>) {
    const updatedCaseObjectsSettings: CaseObjectsSettings = {
      ...this.caseObjectsSettings,
      [objectName]: {
        ...this.caseObjectsSettings[objectName],
        ...objectSettings,
      },
    };
    this.store.dispatch(new UpdatedCaseObjectsSettings({ caseObjectsSettings: updatedCaseObjectsSettings }));
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
