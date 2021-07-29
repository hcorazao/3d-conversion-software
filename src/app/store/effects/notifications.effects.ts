import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { NotificationBuilderService } from '@app/shared/services/notification-builder.service';
import { NotificationActionResolverService } from '@app/shared/services/notification-action-resolver.service';
import { NotificationsActionType } from '../actions';
import { AddToastNotification, AddActionNotification } from '../actions/notifications.actions';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class NotificationsEffects {
  constructor(
    private store: Store,
    private actions$: Actions,
    private notificationBuilder: NotificationBuilderService,
    private notificationActionResolverService: NotificationActionResolverService
  ) {}

  @Effect()
  addToastNotificationByType$ = this.actions$.pipe(
    ofType(NotificationsActionType.addToastNotificationByType),
    map((action: any) => {
      const toastNotification = this.notificationBuilder.createToastNotificationByType(action.payload.type);
      return new AddToastNotification({ toastNotification });
    })
  );

  @Effect()
  addActionNotificationByType$ = this.actions$.pipe(
    ofType(NotificationsActionType.addActionNotificationByType),
    map((action: any) => {
      const actionNotification = this.notificationBuilder.createActionNotificationByType(action.payload.type);
      return new AddActionNotification({ actionNotification });
    })
  );

  @Effect()
  takeActionNotificationActionByType$ = this.actions$.pipe(
    ofType(NotificationsActionType.takeActionNotificationActionByType),
    switchMap((action: any) => {
      this.notificationActionResolverService.resolve(action.payload.notificationType);
      return of({ type: 'NO_ACTION' });
    })
  );
}
