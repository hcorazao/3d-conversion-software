import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
})
export class SwitchComponent implements OnInit {
  @Input() on: boolean;
  @Output() toggled = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit(): void {}

  onClick() {
    this.toggled.emit(!this.on);
  }
}
