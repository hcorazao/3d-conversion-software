import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeleteAccountModalComponent } from '../delete-account-modal/delete-account-modal.component';
import { AdjustProfileImageModalComponent } from '../adjust-profile-image-modal/adjust-profile-image-modal.component';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export enum UserModalTab {
  userModalProfileDetailsTab = 0,
  userModalDesignParametersTab = 1,
  userModalProfilePreferencesTab = 2,
}

export const userModalConfig = {
  height: '866px',
  width: '848px',
  panelClass: 'user-modal-box',
  autoFocus: false,
  backdropClass: 'modal-backdrop',
};

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss'],
})
export class UserModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  selectedIndex = 1;
  firstName: string;

  constructor(
    public translate: TranslateService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UserModalComponent>,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.pipe(select(fromSelectors.getUserFirstName), takeUntil(this.destroy$)).subscribe((firstName: string) => {
      this.firstName = firstName;
    });
  }

  openDeleteAccountModal() {
    this.dialog.open(DeleteAccountModalComponent, {
      panelClass: 'user-modal-box',
      autoFocus: false,
      backdropClass: 'modal-backdrop',
    });
    this.dialogRef.close();
  }

  openAdjustProfileImageModal(profileImageFile: File) {
    const adjustProfileImageModal = this.dialog.open(AdjustProfileImageModalComponent, {
      panelClass: 'user-modal-box',
      autoFocus: false,
      backdropClass: 'modal-backdrop',
    });
    adjustProfileImageModal.componentInstance.profileImageFile = profileImageFile;
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
