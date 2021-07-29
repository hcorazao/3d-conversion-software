import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ButtonType } from '../button/button.component';

@Component({
  selector: 'app-delete-account-modal',
  templateUrl: './delete-account-modal.component.html',
  styleUrls: ['./delete-account-modal.component.scss'],
})
export class DeleteAccountModalComponent implements OnInit {
  ButtonType = ButtonType;

  @Input() translationsPrefix: string;

  constructor(public translate: TranslateService, public dialogRef: MatDialogRef<DeleteAccountModalComponent>) {}

  ngOnInit(): void {}

  deleteAccount() {
    console.log('delete account');
    this.dialogRef.close();
  }
}
