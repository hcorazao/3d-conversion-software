import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-case-folder-dropzone-infobox',
  templateUrl: './case-folder-dropzone-infobox.component.html',
  styleUrls: ['./case-folder-dropzone-infobox.component.scss'],
})
export class CaseFolderDropzoneInfoboxComponent implements OnInit, OnDestroy {
  @Input() draggingOrDropped: boolean;

  private destroy$ = new Subject();
  initialCaseLoading$: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.initialCaseLoading$ = this.store.pipe(select(fromSelectors.isInitialCaseLoading), takeUntil(this.destroy$));
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
