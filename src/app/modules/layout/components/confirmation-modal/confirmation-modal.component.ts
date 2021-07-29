import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ButtonType } from '../button/button.component';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent implements OnInit {
  ButtonType = ButtonType;

  @Input() translationsPrefix: string;

  constructor(public dialogRef: MatDialogRef<ConfirmationModalComponent>) {}

  ngOnInit(): void {}
}
