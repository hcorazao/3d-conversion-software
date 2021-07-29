import { Component, OnInit, Input } from '@angular/core';
import { ToastNotification } from '@app/models/toast-notification.model';
import { DismissToastNotification } from '@app/store/actions/notifications.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-toast-notification',
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss'],
})
export class ToastNotificationComponent implements OnInit {
  @Input() notification: ToastNotification;

  constructor(private store: Store) {}

  ngOnInit(): void {}

  dismiss() {
    this.store.dispatch(new DismissToastNotification({ notificationId: this.notification.id }));
  }
}
