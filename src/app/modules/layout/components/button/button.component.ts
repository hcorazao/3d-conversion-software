import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  ButtonType = ButtonType;

  @Input() type: ButtonType;
  @Input() title: string;
  @Input() matIcon: string;
  @Input() disabled = false;
  @Input() light = false;
  @Input() wide = false;
  @Input() small = false;
  @Input() customClass?: string;
  @Output() clicked = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}

export enum ButtonType {
  primary,
  secondary,
  neutral,
  success,
  danger,
}
