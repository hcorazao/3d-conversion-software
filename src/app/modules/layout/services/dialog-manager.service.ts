import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root',
})
export class DialogManagerService {
  constructor(private dialog: MatDialog) {}

  openConfirmationDialog(translationsPrefix: string, onConfirmation: () => void) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '368px',
      panelClass: 'confirmation-modal-box',
    });
    dialogRef.componentInstance.translationsPrefix = translationsPrefix;
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        onConfirmation();
      }
    });
  }
}
