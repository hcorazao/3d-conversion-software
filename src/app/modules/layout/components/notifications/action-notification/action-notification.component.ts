import { Component, OnInit, Input } from '@angular/core';
import { ActionNotification } from '@app/models/action-notification.model';
import { Store } from '@ngrx/store';
import { DismissActionNotification, TakeActionNotificationActionByType } from '@app/store/actions/notifications.actions';

@Component({
  selector: 'app-action-notification',
  templateUrl: './action-notification.component.html',
  styleUrls: ['./action-notification.component.scss'],
})
export class ActionNotificationComponent implements OnInit {
  @Input() notification: ActionNotification;
  constructor(private store: Store) {}

  ngOnInit(): void {}

  takeAction() {
    this.store.dispatch(
      new TakeActionNotificationActionByType({ notificationId: this.notification.id, notificationType: this.notification.type })
    );
  }

  dismiss() {
    this.store.dispatch(new DismissActionNotification({ notificationId: this.notification.id }));
  }
}
