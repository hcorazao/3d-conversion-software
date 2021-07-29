import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-auto-closing-button',
  templateUrl: './auto-closing-button.component.html',
  styleUrls: ['./auto-closing-button.component.scss'],
})
export class AutoClosingButtonComponent implements OnInit {
  @Input() light: boolean;
  @Input() autoClosingTime = 6;
  @Output() closed = new EventEmitter();

  // tslint:disable-next-line: variable-name
  private _autoClosing = true;
  @Input()
  get autoClosing(): boolean {
    return this._autoClosing;
  }
  set autoClosing(autoClosing: boolean) {
    if (this._autoClosing !== autoClosing) {
      this._autoClosing = autoClosing;
      window.clearTimeout(this.dismissTimeout);
      if (autoClosing) {
        this.dismissTimeout = window.setTimeout(() => this.close(), this.autoClosingTime * 1000);
      } else {
        window.clearTimeout(this.dismissTimeout);
      }
    }
  }

  dismissTimeout: number;

  constructor() {}

  ngOnInit(): void {
    if (this.autoClosing) {
      this.dismissTimeout = window.setTimeout(() => this.close(), this.autoClosingTime * 1000);
    }
  }

  close() {
    window.clearTimeout(this.dismissTimeout);
    this.closed.emit();
  }
}
