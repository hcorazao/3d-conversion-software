import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const shortcutsModalConfig = {
  height: '704px',
  width: '600px',
  panelClass: 'shortcuts-modal-box',
  autoFocus: false,
  backdropClass: 'modal-backdrop',
};

@Component({
  selector: 'app-shortcuts-modal',
  templateUrl: './shortcuts-modal.component.html',
  styleUrls: ['./shortcuts-modal.component.scss'],
})
export class ShortcutsModalComponent implements OnInit, OnDestroy {
  constructor(public translate: TranslateService) {}

  ngOnInit(): void {}
  ngOnDestroy() {}
}
