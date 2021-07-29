import { Injectable } from '@angular/core';
import { ActionNotificationType } from '../../models/enums/action-notification-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { UserModalComponent, userModalConfig, UserModalTab } from '@app/modules/layout/components/user-modal/user-modal.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationActionResolverService {
  constructor(private dialog: MatDialog) {}

  resolve(actionNotificationType: ActionNotificationType) {
    switch (actionNotificationType) {
      case ActionNotificationType.INSTALL_APP:
        console.log('resolve action INSTALL_APP');
        break;
      case ActionNotificationType.SET_PARAMETERS:
        this.openUserModalWithTab(UserModalTab.userModalDesignParametersTab);
        break;
      case ActionNotificationType.SET_PREFERENCES:
        this.openUserModalWithTab(UserModalTab.userModalProfilePreferencesTab);
        break;
      case ActionNotificationType.COMPLETE_PROFILE:
        this.openUserModalWithTab(UserModalTab.userModalProfileDetailsTab);
        break;
    }
  }

  private openUserModalWithTab(selectedTabIndex) {
    const dialogRef = this.dialog.open(UserModalComponent, userModalConfig);
    dialogRef.componentInstance.selectedIndex = selectedTabIndex;
  }
}
