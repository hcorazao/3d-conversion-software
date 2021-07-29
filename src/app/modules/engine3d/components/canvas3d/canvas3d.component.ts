import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { EngineService } from '../../engine/engine.service';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { debounce, takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { InitializeBabylon } from '@app/store/actions/babylon.actions';

export const CANVAS_ELEMENT_ID = 'renderCanvas';

@Component({
  selector: 'app-canvas3d',
  templateUrl: './canvas3d.component.html',
  styleUrls: ['./canvas3d.component.scss'],
})
export class Canvas3dComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild(CANVAS_ELEMENT_ID, { static: true })
  public renderCanvas: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject();
  dentalCaseFolder$: Observable<DentalCaseFolder>;
  devUIActive$: Observable<boolean>;
  canvasResized$ = new Subject();

  spinner = false;
  editMode = false;

  canvasHeight = undefined;
  canvasWidth = undefined;

  constructor(private engine: EngineService, private store: Store) {}

  ngOnInit(): void {
    this.devUIActive$ = this.store.pipe(select(fromSelectors.isDevUIActive), takeUntil(this.destroy$));
  }

  ngAfterViewInit(): void {
    this.store.dispatch(new InitializeBabylon({ canvasElementId: CANVAS_ELEMENT_ID }));
    this.canvasHeight = this.renderCanvas.nativeElement.offsetHeight;
    this.canvasWidth = this.renderCanvas.nativeElement.offsetWidth;
    this.canvasResized$.pipe(debounce(() => interval(100))).subscribe(() => this.engine.resize());
  }

  ngAfterViewChecked(): void {
    const height = this.renderCanvas.nativeElement.offsetHeight;
    const width = this.renderCanvas.nativeElement.offsetWidth;
    if (this.canvasHeight && this.canvasWidth && (this.canvasHeight !== height || this.canvasWidth !== width)) {
      this.canvasHeight = height;
      this.canvasWidth = width;
      this.canvasResized$.next();
    }
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
