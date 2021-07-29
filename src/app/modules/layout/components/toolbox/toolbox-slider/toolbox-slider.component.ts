import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'app-toolbox-slider',
  templateUrl: './toolbox-slider.component.html',
  styleUrls: ['./toolbox-slider.component.scss'],
})
export class ObjectSliderComponent implements OnInit {
  @Input() title: string;
  @Input() value: number;
  @Input() min = 0;
  @Input() max = 1;
  @Input() step = 0.01;
  @Input() disabled = false;
  @Input() switchVisible = true;
  @Output() changedValue = new EventEmitter<number>();
  lastValue: number;
  constructor() {}

  ngOnInit(): void {}

  valueChanged(change: MatSliderChange) {
    // removed as it duplicates last valueDragged value:
    // this.changedValue.emit(change.value);
  }

  toggleScrollVisibility() {
    if (this.value) {
      this.lastValue = this.value;
    }
    if (this.value > 0) {
      this.changedValue.emit(0);
    } else if (this.value === 0 || this.value === undefined) {
      this.changedValue.emit(this.lastValue > 0 ? this.lastValue : 1);
    } else {
      this.changedValue.emit(this.lastValue);
    }
  }

  valueDragged(change: MatSliderChange) {
    this.lastValue = change.value;
    this.value = change.value;
    this.changedValue.emit(change.value);
  }
}
