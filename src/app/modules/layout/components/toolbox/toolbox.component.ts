import { Component, OnInit, Output, EventEmitter, Input, ElementRef, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { ToolboxSettings } from '@app/models/toolbox-settings.model';
import { Offset } from '@app/models/offset.model';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('expanded', style({ height: '*', opacity: '1' })),
      state('collapsed', style({ height: 0, opacity: '0' })),

      transition('collapsed => expanded', [group([animate(200, style({ height: '*' })), animate(200, style({ opacity: '1' }))])]),
      transition('expanded => collapsed', [group([animate(200, style({ opacity: '0' })), animate(300, style({ height: 0 }))])]),
    ]),
  ],
})
export class ToolboxComponent implements OnInit {
  @Input() settings: ToolboxSettings;
  @Input() titleTranslationKey: string;
  @Input() minimizable = false;
  @Input() closeable = false;
  @Input() minimized: boolean;
  @Input() minimizeBody = true;
  @Input() width = 264;
  @Input() bigHeader = false;
  @Input() bodyPadding = true;
  @Output() toggleMinimization = new EventEmitter();
  @Output() closed = new EventEmitter();
  @Output() dragOffsetChanged = new EventEmitter<Offset>();
  @Output() focusChanged = new EventEmitter<boolean>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  getPosition(): Offset {
    return new Offset(0, 0);
  }

  endOffset(offset: Offset) {
    this.dragOffsetChanged.emit(offset);
    this.focusChanged.emit(true);
  }
  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:click', ['$event'])
  documentClick(event) {
    this.focusChanged.emit(this.elementRef.nativeElement.contains(event.target));
  }
}
